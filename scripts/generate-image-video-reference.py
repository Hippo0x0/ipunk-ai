"""Generate the original synthetic graphic used in the no-signup trial."""
from pathlib import Path
import struct
import zlib
w,h=640,360
pixels=bytearray()
for y in range(h):
    pixels.append(0)
    for x in range(w):
        color=(225,236,241)
        if y>250:color=(193,165,128)
        if 230<x<400 and 125<y<260:color=(16,116,130)
        if 400<=x<448 and 150<y<225:color=(16,116,130)
        if 413<x<435 and 163<y<212:color=(225,236,241)
        if 240<x<390 and 122<y<135:color=(7,55,70)
        pixels.extend(color)
def chunk(k,d):
    return struct.pack('!I',len(d))+k+d+struct.pack('!I',zlib.crc32(k+d)&0xffffffff)
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!IIBBBBB',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(pixels))+chunk(b'IEND',b'')
dest=Path(__file__).resolve().parent.parent/'dist/evidence/free-image-video/synthetic-mug.png'
dest.parent.mkdir(parents=True,exist_ok=True)
dest.write_bytes(png)
