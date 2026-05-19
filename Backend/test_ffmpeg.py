import subprocess
safe_font = 'C:/Windows/Fonts/arial.ttf'.replace(':', '\\:')
bg_color = '0x1e3a8a'
avatar = 'josh'
avatar_label = f",drawtext=fontfile='{safe_font}':text='Presenter\\\\\\: {avatar.capitalize()}':fontcolor=white@0.5:fontsize=24:x=w-text_w-40:y=h-text_h-40"
command = ['ffmpeg', '-y', '-f', 'lavfi', '-i', f'color=c={bg_color}:s=1280x720:d=1', '-vf', f"drawtext=fontfile='{safe_font}':text='Hello':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=60{avatar_label}", '-c:v', 'libx264', '-t', '1', '-pix_fmt', 'yuv420p', 'test_avatar.mp4']
print('Command:', command)
res = subprocess.run(command, capture_output=True, text=True)
print('Return code:', res.returncode)
print('Stderr:', res.stderr)
