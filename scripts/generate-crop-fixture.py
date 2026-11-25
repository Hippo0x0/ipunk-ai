"""Generate four colored regions and a moving white marker with a tone (no external image library)."""
from pathlib import Path
import subprocess,argparse
parser=argparse.ArgumentParser()
parser.add_argument("--ffmpeg",default="ffmpeg")
args=parser.parse_args()
out=Path(__file__).resolve().parent.parent/'dist/evidence/video-crop/source.mp4'
out.parent.mkdir(parents=True,exist_ok=True)
proc=subprocess.Popen([args.ffmpeg,'-v','error','-f','rawvideo','-pixel_format','rgb24','-video_size','640x360','-framerate','24','-i','pipe:0','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','4','-c:v','libx264','-crf','12','-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart','-shortest','-y',str(out)],stdin=subprocess.PIPE)
top=bytes((210,30,30))*320+bytes((30,160,60))*320
bottom=bytes((25,55,210))*320+bytes((225,200,30))*320
for i in range(96):
 frame=bytearray(top*180+bottom*180)
 left=60+5*i
 for y in range(160,200):
  start=(y*640+left)*3;frame[start:start+40*3]=bytes((255,255,255))*40
 proc.stdin.write(frame)
proc.stdin.close()
if proc.wait():raise RuntimeError('Fixture encoding failed')
