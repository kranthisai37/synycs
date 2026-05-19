import subprocess
import os

media_path = "c:/Users/DELL/Downloads/Project/Backend/media/videos"
os.makedirs(media_path, exist_ok=True)

filename = "test_render.mp4"
filepath = os.path.join(media_path, filename)

font_path = "C:/Windows/Fonts/arial.ttf".replace('\\', '/')
safe_font = font_path.replace(':', '\\:')

title_path = os.path.join(media_path, "test_title.txt").replace('\\', '/')
script_path = os.path.join(media_path, "test_script.txt").replace('\\', '/')

with open(title_path, 'w', encoding='utf-8') as f: f.write("Test AI Project")
with open(script_path, 'w', encoding='utf-8') as f: f.write("This is a test script for AI video generation.")

safe_title_path = title_path.replace(':', '\\:')
safe_script_path = script_path.replace(':', '\\:')

bg_image = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&h=720&fit=crop"

command = [
    'ffmpeg', '-y',
    '-loop', '1', '-i', bg_image,
    '-t', '5',
    '-filter_complex', f"[0:v]scale=1280:720,drawtext=fontfile='{safe_font}':text='Hello World':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=60[v]",
    '-map', '[v]',
    '-pix_fmt', 'yuv420p',
    filepath
]

print("Running command:", " ".join(command))
result = subprocess.run(command, capture_output=True, text=True)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("Exit Code:", result.returncode)
