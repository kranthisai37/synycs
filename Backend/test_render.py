import os
import django
import sys

# Set up Django environment
sys.path.append('c:/Users/DELL/Downloads/Project/Backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from videos.models import VideoProject
from videos.services import generate_mock_video

def test_render():
    # Get the latest failed project
    project = VideoProject.objects.filter(status='FAILED').first()
    if not project:
        print("No failed projects found.")
        return

    print(f"Testing render for Project: {project.title} (ID: {project.id})")
    print(f"Slides: {project.slides}")
    
    try:
        result = generate_mock_video(project)
        print(f"Render Result: {result}")
    except Exception as e:
        print(f"Render Failed with Error: {e}")

if __name__ == "__main__":
    test_render()
