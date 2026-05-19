import os
import django
import sys

# Set up Django environment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from videos.models import VideoProject
from videos.services import generate_mock_video, simulate_rendering

def run_test():
    # Create a dummy project with the new structure
    project = VideoProject.objects.create(
        title="Dynamic Multi-Scene Compilation Test",
        script="First scene demonstrates the new sequential image builder. Second scene tests the rate-limit delay. Third scene verifies successful background compilation.",
        mode='AVATAR',
        engine='COMMUNITY',
        avatar='sophia',
        voice='alloy',
        slides=[
            {
                "id": 1,
                "text": "First scene demonstrates the new sequential image builder.",
                "duration": 6,
                "startTime": 0,
                "type": "IMAGE",
                "visualPrompt": "Futuristic coding terminal showing success logs, glowing screen, high tech cyber aesthetic",
                "imageUrl": "https://image.pollinations.ai/prompt/Futuristic%20coding%20terminal%20showing%20success%20logs%20glowing%20screen%20high%20tech%20cyber%20aesthetic?width=1280&height=720&nologo=true&private=true&model=flux&seed=847322"
            },
            {
                "id": 2,
                "text": "Second scene tests the rate-limit delay.",
                "duration": 6,
                "startTime": 6,
                "type": "IMAGE",
                "visualPrompt": "Cooperative network nodes sending data packets, bright neon lines, dark tech theme",
                "imageUrl": "https://image.pollinations.ai/prompt/Cooperative%20network%20nodes%20sending%20data%20packets%20bright%20neon%20lines%20dark%20tech%20theme?width=1280&height=720&nologo=true&private=true&model=flux&seed=193859"
            },
            {
                "id": 3,
                "text": "Third scene verifies successful background compilation.",
                "duration": 6,
                "startTime": 12,
                "type": "IMAGE",
                "visualPrompt": "Stunning success badge, vibrant holographic trophy, golden ribbons, high resolution",
                "imageUrl": "https://image.pollinations.ai/prompt/Stunning%20success%20badge%20vibrant%20holographic%20trophy%20golden%20ribbons%20high%20resolution?width=1280&height=720&nologo=true&private=true&model=flux&seed=294811"
            }
        ]
    )

    print(f"Created Test Project ID: {project.id}")
    print("Starting rendering process...")
    
    # Run the simulation directly (synchronously for this test)
    simulate_rendering(project.id)
    
    # Reload project to check status
    project.refresh_from_db()
    print(f"Final Status: {project.status}")
    print(f"Video URL: {project.video_url}")

if __name__ == "__main__":
    run_test()
