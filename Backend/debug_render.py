import os
import django
import sys
import subprocess

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from videos.models import VideoProject
from videos.services import generate_mock_video

def debug_render():
    try:
        project = VideoProject.objects.get(id=49)
    except:
        project = VideoProject.objects.all().order_by('-id').first()
        
    print(f"Debugging Project: {project.id}")
    
    # We'll override generate_mock_video's subprocess.run to see the command
    import videos.services
    original_run = subprocess.run
    
    def mock_run(cmd, *args, **kwargs):
        print("\n--- FFMPEG COMMAND ---")
        print(" ".join(cmd))
        print("----------------------\n")
        return original_run(cmd, *args, **kwargs)
        
    subprocess.run = mock_run
    
    try:
        path = generate_mock_video(project)
        print(f"Result: {path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_render()
