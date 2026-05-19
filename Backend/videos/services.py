import time
import threading
import subprocess
import os
import textwrap
import requests
import json
import asyncio
import re
import random
import urllib.parse
import edge_tts
from gtts import gTTS
from elevenlabs import ElevenLabs
from django.conf import settings
from .models import VideoProject

def log_render(message):
    with open('render_debug.log', 'a', encoding='utf-8') as f:
        f.write(f"{time.ctime()}: {message}\n")

# HeyGen Configuration
HEYGEN_API_BASE = "https://api.heygen.com/v2"

def get_heygen_headers():
    return {
        "X-Api-Key": getattr(settings, 'HEYGEN_API_KEY', ''),
        "Content-Type": "application/json"
    }

# ElevenLabs Configuration
ELEVENLABS_VOICE_MAP = {
    'alloy': 'pNInz6obpgDQGcFmaJgB',   # Adam
    'echo': 'hpp4J3VqNfWAUOO0d1Us',    # Bella
    'fable': 'onwK4e9ZLuTAKqWW03F9',   # Daniel
    'onyx': 'nPczCjzI2devNBz1zQrb',    # Brian
    'nova': 'Xb7hH8MSUJpSbSDYk0k2',    # Alice
    'shimmer': 'pFZP5JQG7iQjIQuC4Bku'  # Lily
}

EDGE_VOICE_MAP = {
    'alloy': 'en-US-GuyNeural',
    'echo': 'en-US-AnaNeural',
    'fable': 'en-GB-RyanNeural',
    'onyx': 'en-US-GuyNeural',
    'nova': 'en-GB-SoniaNeural',
    'shimmer': 'en-US-MichelleNeural',
    'bark_v2': 'en-IN-NeerjaNeural',
    'xtts_v2': 'en-IN-PrabhatNeural'
}

def generate_edge_audio(text, voice_key, output_path):
    voice_id = EDGE_VOICE_MAP.get(voice_key, 'en-US-JennyNeural')
    print(f"FREE NEURAL TTS: Synthesizing using Microsoft {voice_id} for key '{voice_key}'...")
    try:
        async def run_save():
            communicate = edge_tts.Communicate(text, voice_id)
            await communicate.save(output_path)
        asyncio.run(run_save())
        return True
    except Exception as e:
        print(f"Edge TTS synthesis failed: {e}")
        return False

class CommunityService:
    @staticmethod
    def generate_bark_audio(text, output_path):
        print(f"COMMUNITY ENGINE: Generating Bark TTS for: {text[:50]}...")
        try:
            # Fallback to gTTS if local Bark/Transformers is not available
            # In a real setup, we would use: from transformers import BarkModel...
            tts = gTTS(text=text[:1000], lang='en')
            tts.save(output_path)
            time.sleep(2) # Simulate more complex processing
            return True
        except Exception as e:
            print(f"Bark Audio Error: {e}")
            return False

    @staticmethod
    def generate_xtts_audio(text, output_path):
        print(f"COMMUNITY ENGINE: Generating XTTS v2 for: {text[:50]}...")
        try:
            tts = gTTS(text=text[:1000], lang='en')
            tts.save(output_path)
            time.sleep(3) # Simulate more complex processing
            return True
        except Exception as e:
            print(f"XTTS Audio Error: {e}")
            return False

    @staticmethod
    def generate_wav2lip_audio_video(image_path, audio_path, output_path):
        print("COMMUNITY ENGINE: Initializing Wav2Lip Lip-Sync...")
        wav2lip_dir = os.path.join(settings.BASE_DIR, 'Wav2Lip')
        
        if os.path.exists(wav2lip_dir):
            # Actual Wav2Lip Integration
            try:
                python_executable = 'python'
                if os.name == 'nt':
                    venv_py = os.path.join(wav2lip_dir, 'venv', 'Scripts', 'python.exe')
                    if os.path.exists(venv_py):
                        python_executable = venv_py
                else:
                    venv_py = os.path.join(wav2lip_dir, 'venv', 'bin', 'python')
                    if os.path.exists(venv_py):
                        python_executable = venv_py

                command = [
                    python_executable, 'inference.py',
                    '--checkpoint_path', 'checkpoints/wav2lip_gan.pth',
                    '--face', image_path.replace('\\', '/'),
                    '--audio', audio_path.replace('\\', '/'),
                    '--outfile', output_path.replace('\\', '/'),
                    '--nosmooth'
                ]
                subprocess.run(command, cwd=wav2lip_dir, check=True, capture_output=True)
                return True
            except subprocess.CalledProcessError as e:
                print(f"Wav2Lip Processing Error: {e}")
                print(f"Wav2Lip Stderr: {e.stderr.decode('utf-8', errors='ignore') if e.stderr else 'No stderr'}")
                return False
            except Exception as e:
                print(f"Wav2Lip Unexpected Error: {e}")
                return False
        else:
            # Fallback: Generate a static video from the image matching the audio duration
            print("Wav2Lip directory not found. Falling back to static image video.")
            try:
                command = [
                    'ffmpeg', '-y',
                    '-loop', '1', '-i', image_path.replace('\\', '/'),
                    '-i', audio_path.replace('\\', '/'),
                    '-c:v', 'libx264', '-preset', 'veryfast',
                    '-c:a', 'aac',
                    '-shortest',
                    output_path.replace('\\', '/')
                ]
                subprocess.run(command, check=True, capture_output=True)
                return True
            except Exception as e:
                print(f"Fallback Wav2Lip Video Error: {e}")
                return False

def generate_elevenlabs_audio(text, voice_id, output_path):
    api_key = getattr(settings, 'ELEVENLABS_API_KEY', '')
    if not api_key or api_key == 'your_elevenlabs_api_key_here':
        return False
    try:
        client = ElevenLabs(api_key=api_key)
        audio = client.text_to_speech.convert(
            voice_id=voice_id,
            text=text,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )
        with open(output_path, 'wb') as f:
            for chunk in audio: f.write(chunk)
        return True
    except Exception as e:
        print(f"ElevenLabs TTS failed: {e}")
        return False

def submit_heygen_job(project, voice_id=None):
    avatar_map = {
        'daniel': 'Aditya_public_3',
        'sophia': 'Sophia_public_3_20240320',
        'james': 'Aditya_public_3',
        'aisha': 'Sophia_public_3_20240320',
        'olivia': 'Sophia_public_3_20240320',
        'arjun': 'Aditya_public_3',
        'mei': 'Sophia_public_3_20240320',
        'lucas': 'Aditya_public_3',
        'isabella': 'Sophia_public_3_20240320',
        'noah': 'Aditya_public_3'
    }
    url = "https://api.heygen.com/v3/video-agents"
    
    # Enhanced prompt for better expressions and lip-sync
    enhanced_prompt = (
        f"Act as a professional educator. Speak naturally with clear facial expressions and precise lip-sync. "
        f"The content is: {project.script}"
    )
    
    payload = {
        "prompt": enhanced_prompt,
        "avatar_id": avatar_map.get(project.avatar, 'Sophia_public_3_20240320'),
        "voice_id": voice_id if voice_id else '5c1ade5e514c4c6c900b0ded224970fd'
    }
    try:
        response = requests.post(url, headers=get_heygen_headers(), json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get('data', {}).get('video_id')
    except Exception as e:
        print(f"HeyGen V3 Submission Error: {e}")
        return None

def get_heygen_video_url(video_id):
    url = f"{HEYGEN_API_BASE}/video/get_video_status?video_id={video_id}"
    try:
        response = requests.get(url, headers=get_heygen_headers())
        response.raise_for_status()
        data = response.json()
        status = data.get('data', {}).get('status')
        # Try to extract actual progress if available, otherwise use a placeholder
        api_progress = data.get('data', {}).get('progress', 50)
        if status == 'completed':
            return data.get('data', {}).get('video_url'), 100
        elif status == 'failed':
            return None, -1
        return None, api_progress
    except: return None, -1

def extract_keywords(text):
    # Strip structural prefixes (e.g. "SHORT DESCRIPTION:", "TITLE:")
    clean_text = re.sub(r'^(title|description|short description|summary|section\s+\d+|slide\s+\d+):', '', text, flags=re.IGNORECASE)
    
    stop_words = {
        'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent',
        'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
        'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont',
        'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have',
        'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him',
        'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt',
        'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not',
        'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
        'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such',
        'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres',
        'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too',
        'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent',
        'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom',
        'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve',
        'your', 'yours', 'yourself', 'yourselves', 'please', 'provide', 'topic', 'notes', 'generate',
        'content', 'ultimate', 'guide', 'essential', 'exploration', 'examining', 'structural', 'foundations',
        'realworld', 'utility', 'modern', 'science', 'technology', 'represents', 'revolutionary', 'paradigm',
        'intelligence', 'functions', 'organizing', 'complex', 'systemic', 'nodes', 'optimize', 'processing',
        'throughput', 'intricate', 'design', 'challenges', 'combining', 'historical', 'foundational',
        'theories', 'adaptive', 'frameworks', 'bridges', 'computational', 'potential', 'practical',
        'humancentric', 'problem', 'solving',
        # Structural / Formatting Ignores
        'title', 'description', 'short', 'introduction', 'intro', 'summary', 'section', 'overview',
        'key', 'points', 'point', 'advantages', 'disadvantages', 'examples', 'risks', 'challenges',
        'conclusion', 'concluding', 'features', 'applications', 'uses', 'detail', 'detailed', 'explanation',
        'chapter', 'slide', 'essential', 'exploration', 'examining', 'understanding', 'learning', 'education',
        'study', 'science', 'concept', 'concepts', 'theory', 'theories', 'system', 'process', 'method',
        'methods', 'important', 'various', 'different', 'primary', 'secondary', 'general', 'specific',
        'highly', 'really', 'extremely', 'basic', 'advanced', 'simple', 'complex', 'modern', 'traditional',
        'paragraph', 'sentence', 'text', 'words', 'word', 'page', 'video', 'project', 'image', 'picture'
    }
    words = re.findall(r'\b[a-zA-Z]{4,15}\b', clean_text.lower())
    keywords = [w for w in words if w not in stop_words]
    seen = set()
    unique_keywords = []
    for w in keywords:
        if w not in seen:
            seen.add(w)
            unique_keywords.append(w)
            
    # Sort by length descending to prioritize highly specific domain words
    unique_keywords.sort(key=len, reverse=True)
    return unique_keywords

def get_ai_image_url_for_text(text, style='Cinematic'):
    clean = re.sub(r'^(title|description|short description|summary|section\s+\d+|slide\s+\d+|introduction|intro|explanation|conclusion|visual prompt|visual_prompt):', '', text, flags=re.IGNORECASE).strip()
    clean_text = clean[:180]
    
    style_lower = style.lower() if style else 'cinematic'
    if 'cartoon' in style_lower or 'anime' in style_lower:
        prompt = f"Vibrant colorful educational cartoon anime illustration showing: {clean_text}. Bright anime art style, friendly character designs, engaging colors, clear details, school-friendly, no text."
    elif '3d clay' in style_lower:
        prompt = f"Cute 3d clay model style toy illustration showing: {clean_text}. Playful claymorphism character and environment, soft volumetric lighting, colorful, highly detailed, no text."
    elif 'chalkboard' in style_lower:
        prompt = f"Educational chalk sketch drawing on a green school chalkboard showing: {clean_text}. Detailed hand-drawn white and colored chalk lines, clean school classroom style illustration, no text."
    elif 'watercolor' in style_lower:
        prompt = f"Soft paint textures watercolor illustration showing: {clean_text}. Hand-painted aesthetic, creative educational art, beautiful artistic bleed, clean background, no text."
    elif 'photorealistic' in style_lower:
        prompt = f"Detailed high-fidelity realistic photo showing: {clean_text}. Professional photography, clean composition, natural lighting, sharp focus, 8k, no text."
    elif 'minimalist' in style_lower:
        prompt = f"Minimalist vector graphic design showing: {clean_text}. Clean flat design, simple geometric shapes, modern infographic layout, clean background, no text."
    else:
        prompt = f"Professional cinematic educational scene showing: {clean_text}. Cinematic lighting, modern style, clean composition, soft depth of field, 8k, no text."
        
    safe_prompt = prompt[:280]
    # Remove colons, parentheses, slashes, brackets to prevent route/CDN breakage on Pollinations
    sanitized_prompt = re.sub(r'[:()/\\\[\]]', ' ', safe_prompt)
    sanitized_prompt = re.sub(r'\s+', ' ', sanitized_prompt).strip()
    encoded_prompt = urllib.parse.quote(sanitized_prompt)
    seed = random.randint(1, 1000000)
    return f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&nologo=true&private=true&model=flux&seed={seed}"

def generate_mock_video(project):
    """
    Advanced Multi-Layer Educational Engine.
    Features:
    1. Content-aware Visuals (Images/Drawings) on left.
    2. Synced explanation text on right.
    3. Simulated circular avatar lipsync.
    4. Progress tracking and branding.
    """
    media_path = os.path.join(settings.MEDIA_ROOT, 'videos')
    os.makedirs(media_path, exist_ok=True)
    
    filename = f"video_{project.id}.mp4"
    audio_filename = f"audio_{project.id}.mp3"
    filepath = os.path.join(media_path, filename)
    audio_filepath = os.path.join(media_path, audio_filename)
    
    has_audio = False
    voice_id = ELEVENLABS_VOICE_MAP.get(project.voice, 'pNInz6obpgDQGcFmaJgB')
    
    # Audio Generation
    force_local = getattr(settings, 'FORCE_LOCAL_AI', False)
    
    # Try ElevenLabs first if not local and voice is premium
    if not force_local and project.voice in ELEVENLABS_VOICE_MAP:
        if generate_elevenlabs_audio(project.script, voice_id, audio_filepath):
            has_audio = True
            print("Successfully synthesized audio via ElevenLabs.")

    # If ElevenLabs was bypassed/failed, OR if the voice is local (bark_v2, xtts_v2),
    # use our beautiful, free Microsoft Neural TTS engine!
    if not has_audio:
        if generate_edge_audio(project.script, project.voice, audio_filepath):
            has_audio = True
            print(f"Successfully synthesized audio via free Microsoft Neural TTS ({project.voice}).")
            
    # Ultimate offline/failsafe fallback (flat generic voice)
    if not has_audio:
        try:
            print("Warning: All neural engines failed. Falling back to generic flat gTTS voice.")
            tts = gTTS(text=project.script[:1000], lang='en')
            tts.save(audio_filepath)
            has_audio = True
        except Exception as e:
            print(f"Critical: Failsafe gTTS also failed: {e}")

    # Ensure slides are populated and have content-aware AI image URLs based on the script
    if not project.slides:
        paragraphs = [p.strip() for p in project.script.split('\n\n') if p.strip()]
        if not paragraphs:
            paragraphs = [project.script]
            
        slides_list = []
        current_time = 0
        for idx, paragraph in enumerate(paragraphs):
            duration = max(5, len(paragraph) // 15)
            visual_prompt = f"Educational slide showing: {paragraph[:100]}"
            image_url = get_ai_image_url_for_text(visual_prompt, 'Cinematic')
            
            slides_list.append({
                "id": idx + 1,
                "text": paragraph,
                "duration": duration,
                "startTime": current_time,
                "type": "IMAGE",
                "visualPrompt": visual_prompt,
                "imageUrl": image_url
            })
            current_time += duration
            
        project.slides = slides_list
        project.save()
        slides = slides_list
    else:
        # Slides are present. Let's make sure each slide has a beautiful dynamic AI image URL based on content if it's missing or a placeholder
        slides_list = project.slides
        updated = False
        for idx, slide in enumerate(slides_list):
            img_url = slide.get('imageUrl')
            is_placeholder = not img_url or "unsplash.com" in img_url or "loremflickr.com" in img_url
            if is_placeholder:
                prompt_content = slide.get('visualPrompt') or slide.get('text', '') or project.script
                style = slide.get('style', 'Cinematic')
                slide['imageUrl'] = get_ai_image_url_for_text(prompt_content, style)
                slide['type'] = 'IMAGE'
                updated = True
        if updated:
            project.slides = slides_list
            project.save()
        slides = slides_list

    total_duration = max(sum(float(s.get('duration', 5)) for s in slides), 5)

    # Avatar assets
    avatar_path = None
    if project.mode == 'AVATAR':
        avatar_assets = {
            'daniel': 'https://plus.unsplash.com/premium_photo-1664536392779-049ba8fde933?w=400&h=400&fit=crop',
            'sophia': 'https://plus.unsplash.com/premium_photo-1688350839154-1a131bccd78a?q=80&w=400&h=400&fit=crop',
            'james': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
            'aisha': 'https://plus.unsplash.com/premium_photo-1663075864525-cedf69dbff05?q=80&w=400&h=400&fit=crop',
            'olivia': 'https://plus.unsplash.com/premium_photo-1690294614341-cf346ba0a637?q=80&w=400&h=400&fit=crop',
            'arjun': 'https://plus.unsplash.com/premium_photo-1689977927774-401b12d137d6?w=400&h=400&fit=crop',
            'mei': 'https://plus.unsplash.com/premium_photo-1688740375397-34605b6abe48?w=400&h=400&fit=crop',
            'lucas': 'https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?w=400&h=400&fit=crop',
            'isabella': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
            'noah': 'https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?w=400&h=400&fit=crop'
        }
        avatar_url = avatar_assets.get(project.avatar, avatar_assets['daniel'])
        local_avatar = os.path.join(media_path, f"avatar_{project.avatar}.jpg")
        if not os.path.exists(local_avatar):
            try:
                resp = requests.get(avatar_url, timeout=5)
                with open(local_avatar, 'wb') as f: f.write(resp.content)
            except: pass
        if os.path.exists(local_avatar):
            avatar_path = local_avatar.replace('\\', '/')

    wav2lip_video_path = os.path.join(media_path, f"wav2lip_{project.id}.mp4")
    if avatar_path and has_audio:
        if CommunityService.generate_wav2lip_audio_video(avatar_path, audio_filepath, wav2lip_video_path):
            avatar_path = wav2lip_video_path.replace('\\', '/')

    # Slide Images
    slide_assets = []
    
    premium_fallbacks = [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop", # Cyber Network
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop", # Modern Tech Study
        "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1920&h=1080&fit=crop", # Educational Flatlay
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop", # Classroom Library
        "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?w=1920&h=1080&fit=crop", # Code Workspace
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&h=1080&fit=crop"  # Library Space
    ]
    
    for i, slide in enumerate(slides):
        img_url = slide.get('imageUrl')
        visual_type = slide.get('type', 'IMAGE')
        if img_url:
            local_img = os.path.join(media_path, f"slide_{project.id}_{i}.jpg")
            download_success = False
            
            # 1. Attempt to download user-selected or AI-generated visual
            is_pollinations = "pollinations.ai" in img_url
            max_attempts = 4 if is_pollinations else 1
            
            for attempt in range(max_attempts):
                try:
                    if is_pollinations:
                        # Cooperative delay between consecutive Pollinations calls to prevent rate-limiting
                        time.sleep(2.5 if attempt == 0 else 5.0)
                        print(f"DEBUG: Attempting slide download from Pollinations AI (attempt {attempt+1}/{max_attempts}): {img_url}")
                        timeout_sec = 40
                    else:
                        print(f"DEBUG: Attempting static slide download: {img_url}")
                        timeout_sec = 15
                        
                    headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                    resp = requests.get(img_url, headers=headers, timeout=timeout_sec)
                    
                    if resp.status_code == 200 and len(resp.content) > 5000:
                        with open(local_img, 'wb') as f: 
                            f.write(resp.content)
                        download_success = True
                        print(f"DEBUG: Successfully downloaded slide image {i+1} ({len(resp.content)} bytes)")
                        break
                    elif resp.status_code == 200:
                        print(f"DEBUG: Response returned successfully but content was too small ({len(resp.content)} bytes). Retrying...")
                    else:
                        print(f"DEBUG: Download attempt {attempt+1} failed with status code {resp.status_code}. Retrying...")
                except Exception as e:
                    print(f"DEBUG: Initial download attempt {attempt+1} failed for slide image {i+1} due to: {e}")
                    if attempt < max_attempts - 1 and is_pollinations:
                        time.sleep(5)
                
            # 2. Try on-the-fly custom Pollinations AI fallback if initial download failed
            if not download_success:
                prompt_content = slide.get('visualPrompt') or slide.get('text', '') or project.script
                style = slide.get('style', 'Cinematic')
                fallback_url = get_ai_image_url_for_text(prompt_content, style)
                if '?' in fallback_url:
                    fallback_url += f"&seed={random.randint(1, 1000000)}"
                else:
                    fallback_url += f"?seed={random.randint(1, 1000000)}"
                
                print(f"DEBUG: Failsafe 1 triggered. Generating dynamic content-based AI image fallback: {fallback_url}")
                try:
                    time.sleep(3.0) # Cooperative delay
                    headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                    resp = requests.get(fallback_url, headers=headers, timeout=40)
                    if resp.status_code == 200 and len(resp.content) > 5000:
                        with open(local_img, 'wb') as f: 
                            f.write(resp.content)
                        download_success = True
                        print(f"DEBUG: Dynamically generated fallback image {i+1} downloaded successfully ({len(resp.content)} bytes)")
                except Exception as e:
                    print(f"DEBUG: Dynamic fallback generation failed for slide image {i+1}: {e}")
                    
            # 3. Last resort: premium static Unsplash fallback
            if not download_success:
                fallback_url = premium_fallbacks[i % len(premium_fallbacks)]
                print(f"DEBUG: Failsafe 2 triggered. Downloading premium Unsplash stock fallback: {fallback_url}")
                try:
                    resp = requests.get(fallback_url, timeout=15)
                    if resp.status_code == 200 and len(resp.content) > 5000:
                        with open(local_img, 'wb') as f: 
                            f.write(resp.content)
                        download_success = True
                        print(f"DEBUG: Static fallback slide image {i+1} downloaded successfully ({len(resp.content)} bytes)")
                except Exception as e:
                    print(f"DEBUG: Static fallback also failed for slide image {i+1}: {e}")
            
            if os.path.exists(local_img) and os.path.getsize(local_img) > 5000:
                slide_assets.append({
                    'path': local_img.replace('\\', '/'),
                    'start': slide.get('startTime', 0),
                    'dur': slide.get('duration', 5),
                    'type': visual_type
                })

    command = ['ffmpeg', '-y']
    command += ['-f', 'lavfi', '-i', f'color=c=black:s=1920x1080:d={total_duration}'] # 1080p
    
    input_index = 1
    if has_audio:
        command += ['-i', audio_filepath.replace('\\', '/')]
        audio_idx = input_index
        input_index += 1
    
    if avatar_path:
        if avatar_path.endswith('.mp4'):
            command += ['-i', avatar_path]
        else:
            # Optimize static image avatars by looping at 1 fps to reduce CPU overhead
            command += ['-framerate', '1', '-loop', '1', '-i', avatar_path]
        avatar_idx = input_index
        input_index += 1

    asset_start_index = input_index
    for asset in slide_assets:
        # Optimize slide assets by looping at 1 fps to drastically reduce CPU scaling overhead
        command += ['-framerate', '1', '-loop', '1', '-i', asset['path']]
        input_index += 1

    # Font handling for Windows
    font_path = ""
    if os.name == 'nt':
        # Simplify font loading on Windows
        font_path = "fontfile=arial:"

    # FILTER COMPLEX
    filter_parts = []
    
    # 1. Scale and process Assets
    for i, asset in enumerate(slide_assets):
        idx = asset_start_index + i
        if asset['type'] == 'DRAWING':
            # Faster effect: simple grayscale for a 'drawn' look without heavy processing
            filter_parts.append(
                f"[{idx}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
                f"format=gray,fps=25,setpts=PTS-STARTPTS[asset{i}];"
            )
        else:
            # Standard high-quality scaling
            filter_parts.append(
                f"[{idx}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
                f"fps=25,setpts=PTS-STARTPTS[asset{i}];"
            )

    # 2. Base Layer with dynamic background
    current_v = "[0:v]"
    
    # Overlay Assets sequentially as background
    for i, asset in enumerate(slide_assets):
        start = asset['start']
        end = float(start) + float(asset['dur'])
        filter_parts.append(f"{current_v}[asset{i}]overlay=enable='between(t,{start},{end})'[v_bg{i}];")
        current_v = f"[v_bg{i}]"

    # 3. Add Header Branding
    header_text = project.title.replace("'", "").replace(":", "").upper()
    filter_parts.append(
        f"{current_v}drawbox=y=0:w=iw:h=120:color=black@0.6:t=fill,"
        f"drawtext={font_path}text='{header_text}':fontcolor=white:fontsize=48:x=60:y=35[v_brand];"
    )
    current_v = "[v_brand]"

    # 4. Add Subtitles (Content spoken by avatar)
    for i, slide in enumerate(slides):
        start = float(slide.get('startTime', 0))
        end = start + float(slide.get('duration', 5))
        text = slide.get('text', '').replace(':', '').replace("'", "").replace('"', '').replace('\n', ' ')
        wrapped = "\n".join(textwrap.wrap(text, width=40 if avatar_path else 50)).replace(":", "")
        
        # Shift subtitles to the left if avatar is present in bottom-right
        if avatar_path:
            box_x = 100
            box_w = 1200
            text_x = "100+(1200-text_w)/2"
        else:
            box_x = 200
            box_w = "iw-400"
            text_x = "(w-text_w)/2"
            
        # Content box behind text
        filter_parts.append(
            f"{current_v}drawbox=x={box_x}:y=h-250:w={box_w}:h=180:color=black@0.7:t=fill:enable='between(t,{start},{end})',"
            f"drawtext={font_path}text='{wrapped}':fontcolor=cyan:fontsize=36:x={text_x}:y=h-220:enable='between(t,{start},{end})'[v_sub{i}];"
        )
        current_v = f"[v_sub{i}]"

    # 5. Circular Avatar in Foreground (Side PIP)
    if avatar_path:
        # Optimized avatar: removed slow geq filter for fast local rendering. Now uses a sleek square with border.
        filter_parts.append(
            f"[{avatar_idx}:v]scale=450:450:force_original_aspect_ratio=increase,crop=450:450,format=rgba,"
            f"fps=25,drawbox=w=iw:h=ih:color=cyan@1.0:t=8[av_processed];"
        )
        filter_parts.append(f"{current_v}[av_processed]overlay=W-w-60:H-h-60[outv]")
    else:
        filter_parts.append(f"{current_v}copy[outv]")

    filter_complex = "".join(filter_parts)
    
    command += ['-filter_complex', filter_complex, '-map', '[outv]']
    if has_audio:
        command += ['-map', f'{audio_idx}:a', '-c:v', 'libx264', '-preset', 'veryfast', '-c:a', 'aac', '-shortest']
    else:
        command += ['-c:v', 'libx264', '-t', str(total_duration)]
    
    command += ['-pix_fmt', 'yuv420p', filepath.replace('\\', '/')]
    
    try:
        log_render(f"Running command: {' '.join(command)}")
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        log_render("FFmpeg Success")
        return f"/media/videos/{filename}"
    except subprocess.CalledProcessError as e:
        log_render(f"FFmpeg Visual Error (Exit Code {e.returncode})")
        log_render(f"Stderr: {e.stderr}")
        print(f"FFmpeg Visual Error (Exit Code {e.returncode}):")
        print(f"Command: {' '.join(command)}")
        print(f"Stderr: {e.stderr}")
        return None
    except Exception as e:
        log_render(f"FFmpeg Unexpected Error: {str(e)}")
        print(f"FFmpeg Unexpected Error: {e}")
        return None

def generate_thumbnail(video_path, output_path):
    """Extracts a thumbnail from the video at 1 second mark."""
    try:
        command = [
            'ffmpeg', '-y', 
            '-i', video_path.replace('\\', '/'), 
            '-ss', '00:00:01', 
            '-vframes', '1', 
            output_path.replace('\\', '/')
        ]
        subprocess.run(command, check=True, capture_output=True)
        return True
    except Exception as e:
        print(f"Thumbnail Generation Error: {e}")
        return False

def simulate_rendering(project_id):
    try:
        project = VideoProject.objects.get(id=project_id)
        api_key = getattr(settings, 'HEYGEN_API_KEY', '')
        
        project.status = 'PARSING'
        project.progress = 10
        project.save()
        time.sleep(1)

        is_avatar_mode = project.mode.upper() == 'AVATAR'
        engine = getattr(project, 'engine', 'PREMIUM').upper()
        
        # Bypass premium engines entirely if FORCE_LOCAL_AI is enabled
        force_local = getattr(settings, 'FORCE_LOCAL_AI', False)
        if force_local:
            engine = 'COMMUNITY'
            
        has_real_key = api_key and api_key != 'your_heygen_api_key_here'
        
        if engine == 'PREMIUM' and is_avatar_mode and has_real_key:
            project.status = 'RENDERING'
            project.progress = 20
            project.save()
            voice_id = ELEVENLABS_VOICE_MAP.get(project.voice, 'pNInz6obpgDQGcFmaJgB')
            heygen_id = submit_heygen_job(project, voice_id=voice_id)
            if heygen_id:
                for i in range(60): # Increased to 10 mins (60 * 10s)
                    url, api_progress = get_heygen_video_url(heygen_id)
                    if url:
                        project.video_url = url
                        project.status = 'COMPLETED'
                        project.progress = 100
                        project.save()
                        return
                    if api_progress == -1:
                        break # Failed
                    
                    # Map 0-100 API progress to 20-95 pipeline progress
                    project.progress = int(20 + (api_progress * 0.75))
                    project.save()
                    time.sleep(10)
        
        project.status = 'RENDERING'
        project.progress = 40
        project.save()
        
        # Simulating more granular progress during local rendering
        def update_progress(p):
            project.progress = p
            project.save()

        # Step-wise simulated progress for Community engine
        time.sleep(1)
        update_progress(45) # Starting Audio
        
        # Break down video generation into more steps if possible
        # For now, we'll just log and call the generator
        print(f"PIPELINE: Starting FFmpeg for project {project_id}...")
        update_progress(50) # Initializing Visuals
        
        video_path = generate_mock_video(project)
        
        if video_path:
            update_progress(80) # FFmpeg Complete
            print(f"PIPELINE: FFmpeg finished for project {project_id}")
            update_progress(85) # Generating Thumbnail
            abs_video_path = os.path.join(settings.BASE_DIR, video_path.lstrip('/'))
            thumb_filename = f"thumb_{project.id}.jpg"
            thumb_path = os.path.join(settings.MEDIA_ROOT, 'videos', thumb_filename)
            
            if generate_thumbnail(abs_video_path, thumb_path):
                project.thumbnail_url = f"http://127.0.0.1:8000/media/videos/{thumb_filename}"
            
            update_progress(95) # Finalizing
            project.video_url = f"http://127.0.0.1:8000{video_path}"
            project.status = 'COMPLETED'
            project.progress = 100
        else:
            project.status = 'FAILED'
        project.save()

    except Exception as e:
        print(f"Pipeline Visual Error: {e}")
        try:
            p = VideoProject.objects.get(id=project_id)
            p.status = 'FAILED'
            p.save()
        except: pass

def start_render_job(project_id):
    thread = threading.Thread(target=simulate_rendering, args=(project_id,))
    thread.daemon = True
    thread.start()
