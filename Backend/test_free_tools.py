import os
import django
import sys

# Set up Django environment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from videos.models import VideoProject
from videos.services import simulate_rendering

def test_bark():
    print("\n--- Testing Bark (Free) Engine ---")
    project = VideoProject.objects.create(
        title="Bark Test Project",
        script="This is a test of the Bark free AI audio engine. It should simulate high-quality open source synthesis.",
        mode='NO_FACE',
        engine='COMMUNITY',
        voice='bark_v2'
    )
    print(f"Project ID: {project.id}")
    simulate_rendering(project.id)
    project.refresh_from_db()
    print(f"Status: {project.status}")
    print(f"Video URL: {project.video_url}")

def test_xtts():
    print("\n--- Testing XTTS v2 (Free) Engine ---")
    project = VideoProject.objects.create(
        title="XTTS Test Project",
        script="This is a test of the XTTS v2 free AI audio engine. It clones voices with high fidelity.",
        mode='AVATAR',
        engine='COMMUNITY',
        voice='xtts_v2',
        avatar='sophia'
    )
    print(f"Project ID: {project.id}")
    simulate_rendering(project.id)
    project.refresh_from_db()
    print(f"Status: {project.status}")
    print(f"Video URL: {project.video_url}")

if __name__ == "__main__":
    test_bark()
    test_xtts()
