"""Generate an original moving test pattern with a tone for compression checks."""
import argparse
from pathlib import Path
import subprocess
p=argparse.ArgumentParser()
p.add_argument('--ffmpeg',default='ffmpeg')
args=p.parse_args()
dest=Path(__file__).resolve().parent.parent/'dist/evidence/video-compressor/motion-and-tone.mp4'
dest.parent.mkdir(parents=True,exist_ok=True)
subprocess.run([args.ffmpeg,'-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc2=s=1280x720:r=24','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','4','-c:v','libx264','-preset','veryfast','-crf','12','-c:a','aac','-movflags','+faststart','-shortest','-y',str(dest)],check=True)
