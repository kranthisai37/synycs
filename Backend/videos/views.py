from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
import random
import re
from .models import VideoProject
from .serializers import VideoProjectSerializer
from .services import start_render_job
from .script_engine import ScriptEngine

from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated

class VideoProjectViewSet(viewsets.ModelViewSet):
    queryset = VideoProject.objects.all().order_by('-created_at')
    serializer_class = VideoProjectSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [AllowAny] # Set to AllowAny to troubleshoot deletion issue

    @action(detail=False, methods=['post'], permission_classes=[])
    def signup(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        
        print(f"DEBUG: Signup attempt for {username}")
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.create_user(username=username, password=password, email=email)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username})

    @action(detail=False, methods=['post'], permission_classes=[])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        print(f"DEBUG: Login attempt for {username}")
        user = authenticate(username=username, password=password)
        
        if user:
            print(f"DEBUG: Login successful for {username}")
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'username': user.username})
        
        print(f"DEBUG: Login failed for {username}")
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'], permission_classes=[])
    def forgot_password(self, request):
        email = request.data.get('email')
        print(f"DEBUG: Forgot password request for {email}")
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Find user by email
            user = User.objects.filter(email=email).first()
            if not user:
                # Also check username just in case
                user = User.objects.filter(username=email).first()
                
            if not user:
                # Security best practice: return success even if user not found to avoid user enumeration
                return Response({'status': 'If the email is registered, a password reset link has been sent.'})
            
            # Generate secure signed token using django.core.signing
            from django.core import signing
            token = signing.dumps({'user_id': user.id}, salt='password-reset-salt')
            
            # Dynamically discover the computer's local network IP address
            import socket
            def get_local_ip():
                try:
                    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                    s.connect(("8.8.8.8", 80))
                    ip = s.getsockname()[0]
                    s.close()
                    return ip
                except Exception:
                    return "127.0.0.1"
            
            local_ip = get_local_ip()
            
            # Create a single clean link using the computer's network IP
            reset_url = f"http://{local_ip}:5173/?mode=reset&token={token}"
            
            # Send password reset mail
            from django.core.mail import send_mail
            from django.conf import settings
            
            subject = 'EduVideo - Reset Your Password'
            message = (
                f"Hello {user.username or 'User'},\n\n"
                f"You requested a password reset for your EduVideo account.\n\n"
                f"Please click the link below to securely update your password:\n"
                f"{reset_url}\n\n"
                f"This link is valid for 1 hour.\n\n"
                f"If you did not request this, please ignore this email.\n\n"
                f"Best regards,\n"
                f"EduVideo Team"
            )
            
            # Check if EMAIL_HOST_USER is configured to avoid empty sender errors
            from_email = getattr(settings, 'EMAIL_HOST_USER', 'noreply@eduvideo.com') or 'noreply@eduvideo.com'
            
            send_mail(
                subject,
                message,
                from_email,
                [user.email or email],
                fail_silently=False,
            )
            
            print(f"SUCCESS: Password reset email sent to {user.email or email}")
            return Response({'status': 'Email sent successfully!'})
            
        except Exception as e:
            print(f"ERROR in forgot_password action: {str(e)}")
            # Fallback output to console to make sure it works for developers
            from django.core import signing
            mock_token = signing.dumps({'user_id': user.id if 'user' in locals() and user else 1}, salt='password-reset-salt')
            mock_url = f"http://localhost:5173/?mode=reset&token={mock_token}"
            print(f"\n========================================\n"
                  f"MOCK EMAIL SENT TO: {email}\n"
                  f"Subject: EduVideo - Reset Your Password\n"
                  f"Link: {mock_url}\n"
                  f"========================================\n")
            return Response({'status': 'Email processed locally (printed to console). To receive it on your phone, configure SMTP in settings.py!'})

    @action(detail=False, methods=['post'], permission_classes=[])
    def reset_password(self, request):
        token = request.data.get('token')
        new_password = request.data.get('password')
        
        print(f"DEBUG: Reset password attempt with token {token[:15]}...")
        
        if not token or not new_password:
            return Response({'error': 'Token and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Decode the signed token
            from django.core import signing
            data = signing.loads(token, salt='password-reset-salt', max_age=3600) # 1 hour max age
            user_id = data.get('user_id')
            
            user = User.objects.get(id=user_id)
            
            # Set new password
            user.set_password(new_password)
            user.save()
            
            # Delete old tokens if any to force a fresh login
            Token.objects.filter(user=user).delete()
            
            print(f"SUCCESS: Password updated for user {user.username}")
            return Response({'status': 'Password reset successfully!'})
            
        except signing.SignatureExpired:
            print("ERROR: Password reset link expired")
            return Response({'error': 'The password reset link has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
        except (signing.BadSignature, User.DoesNotExist) as e:
            print(f"ERROR: Invalid password reset token: {str(e)}")
            return Response({'error': 'Invalid reset link. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"ERROR in reset_password action: {str(e)}")
            return Response({'error': f'Failed to reset password: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_videos = VideoProject.objects.count()
        rendering_count = VideoProject.objects.filter(status__in=['PARSING', 'RENDERING']).count()
        completed_count = VideoProject.objects.filter(status='COMPLETED').count()
        return Response({
            'total_videos': total_videos,
            'rendering_count': rendering_count,
            'completed_count': completed_count,
            'credits': 842 # Mock data for now
        })

    @action(detail=False, methods=['get'])
    def queue(self, request):
        active_renders = VideoProject.objects.filter(status__in=['PARSING', 'RENDERING'])
        serializer = self.get_serializer(active_renders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def shared(self, request):
        shared_projects = VideoProject.objects.filter(is_shared=True)
        serializer = self.get_serializer(shared_projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def templates(self, request):
        templates = [
            {'id': 1, 'name': 'Modern Corporate', 'description': 'Clean and professional.', 'icon': '🎬'},
            {'id': 2, 'name': 'Cinematic Edu', 'description': 'Dramatic storytelling style.', 'icon': '🎥'},
            {'id': 3, 'name': 'Minimalist Tech', 'description': 'Sleek and flat design.', 'icon': '🖥️'},
        ]
        return Response(templates)

    @action(detail=False, methods=['post'])
    def upload_notes(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            content = file.read().decode('utf-8')
            return Response({'text': content})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def generate_script(self, request):
        notes = request.data.get('notes', '')
        directors_notes = request.data.get('directors_notes', '')
        
        if not notes:
            return Response({'error': 'No notes provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        print(f"DEBUG: Generating content for topic: {notes[:50]}")
        
        engine = ScriptEngine()
        conversational_script, suggested_slides = engine.generate(notes, directors_notes)
        
        return Response({
            'script': conversational_script,
            'slides': suggested_slides
        })

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        project = self.get_object()
        project.is_shared = True
        project.save()
        return Response({'status': 'shared'})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_create(self, serializer):
        instance = serializer.save()
        start_render_job(instance.id)

    def perform_update(self, serializer):
        instance = serializer.save()
        # Re-trigger rendering on update
        instance.status = 'PENDING'
        instance.progress = 0
        instance.save()
        start_render_job(instance.id)

# Custom Range Requests Media Serving View to support scrubbing/seeking in browser players
import os
import mimetypes
from django.conf import settings
from django.http import Http404, HttpResponse, StreamingHttpResponse

def serve_media_with_range(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if not os.path.exists(file_path) or os.path.isdir(file_path):
        raise Http404("File not found")

    size = os.path.getsize(file_path)
    content_type, encoding = mimetypes.guess_type(file_path)
    content_type = content_type or 'application/octet-stream'

    range_header = request.META.get('HTTP_RANGE', '').strip()
    range_match = re.match(r'bytes\s*=\s*(\d+)\s*-\s*(\d*)', range_header, re.I)

    if not range_match:
        # Full file request but still announce range support for seekable players
        try:
            file = open(file_path, 'rb')
            response = StreamingHttpResponse(file, content_type=content_type)
            response['Accept-Ranges'] = 'bytes'
            response['Content-Length'] = str(size)
            return response
        except Exception as e:
            return HttpResponse(status=500)

    first_byte, last_byte = range_match.groups()
    first_byte = int(first_byte) if first_byte else 0
    last_byte = int(last_byte) if last_byte else size - 1

    if first_byte >= size:
        return HttpResponse(status=416)  # Range Not Satisfiable

    last_byte = min(last_byte, size - 1)
    length = last_byte - first_byte + 1

    try:
        file = open(file_path, 'rb')
        file.seek(first_byte)
    except Exception as e:
        return HttpResponse(status=500)

    def file_iterator(f, chunk_size=8192, total_length=length):
        remaining = total_length
        try:
            while remaining > 0:
                bytes_to_read = min(chunk_size, remaining)
                data = f.read(bytes_to_read)
                if not data:
                    break
                remaining -= len(data)
                yield data
        finally:
            f.close()

    response = StreamingHttpResponse(
        file_iterator(file),
        status=206,
        content_type=content_type
    )
    response['Content-Range'] = f'bytes {first_byte}-{last_byte}/{size}'
    response['Content-Length'] = str(length)
    response['Accept-Ranges'] = 'bytes'
    return response

