"""Create original solid-colour media for the video metadata checker; not AI output."""
import argparse
import subprocess
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument('--ffmpeg',default='ffmpeg')
args=parser.parse_args()
dest=Path(__file__).resolve().parent.parent/'dist/evidence/canva-video'
dest.mkdir(parents=True,exist_ok=True)
for filename,size,duration,color in [('synthetic-landscape-8s.mp4','1920x1080','8','teal'),('synthetic-portrait-6s.mp4','1080x1920','6','orange')]:
    subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error','-f','lavfi','-i',f'color=c={color}:s={size}:r=1','-t',duration,'-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart','-y',str(dest/filename)],check=True)
