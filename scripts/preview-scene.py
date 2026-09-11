#!/usr/bin/env python3
"""Composite a scene's layers with its real cutout, for review only.

Not used by the site — the browser does this compositing. This exists so the
plates can be judged as one picture while they are being tuned.
"""
import os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SC = os.path.join(HERE, "..", "public/images/hero/scenes")
KN = os.path.join(HERE, "..", "public/images/hero/knives")
W, H, SY = 1600, 900, 0.635

def cover(im, w, h):
    r = max(w / im.width, h / im.height)
    im = im.resize((max(int(im.width * r), w), max(int(im.height * r), h)), Image.LANCZOS)
    return im.crop(((im.width - w) // 2, (im.height - h) // 2,
                    (im.width - w) // 2 + w, (im.height - h) // 2 + h))

def compose(slug, scale=0.38, rot=0.0, x=0.5):
    c = cover(Image.open(f"{SC}/{slug}-sky.webp").convert("RGB"), W, H)
    for L in ("far", "mid", "surface"):
        p = f"{SC}/{slug}-{L}.webp"
        if os.path.exists(p):
            l = cover(Image.open(p).convert("RGBA"), W, H)
            c.paste(l, (0, 0), l)
    kp = f"{KN}/{slug}.png"
    if os.path.exists(kp):
        k = Image.open(kp).convert("RGBA")
        if rot:
            k = k.rotate(rot, expand=True, resample=Image.BICUBIC)
        kw = int(W * scale)
        k = k.resize((kw, max(int(k.height * kw / k.width), 1)), Image.LANCZOS)
        a = np.array(k)[:, :, 3]
        bottom = int(np.nonzero(a.max(axis=1) > 12)[0].max())
        # contact shadow under the real silhouette
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        from PIL import ImageFilter
        m = Image.fromarray(a).resize((k.width, int(k.height * 0.20)), Image.LANCZOS)
        sm = Image.new("L", (W, H), 0)
        sm.paste(m, (int(W * x - k.width / 2), int(H * SY - int(k.height * 0.10))))
        sm = sm.filter(ImageFilter.GaussianBlur(16))
        sh.putalpha(sm.point(lambda v: int(v * 0.62)))
        c.paste(Image.new("RGB", (W, H), (18, 12, 8)), (0, 0), sh)
        c.paste(k, (int(W * x - k.width / 2), int(H * SY - bottom + 6)), k)
    p = f"{SC}/{slug}-fore.webp"
    if os.path.exists(p):
        f = Image.open(p).convert("RGBA")
        fh = int(H * 0.28)
        f = f.resize((W, fh), Image.LANCZOS)
        c.paste(f, (0, H - fh), f)
    return c

if __name__ == "__main__":
    out = sys.argv[1]
    specs = [a.split(":") for a in sys.argv[2:]]
    ims = [compose(s[0], float(s[1]), float(s[2])) for s in specs]
    sheet = Image.new("RGB", (W, H * len(ims)))
    for i, im in enumerate(ims):
        sheet.paste(im, (0, i * H))
    sheet = sheet.resize((1080, int(1080 * sheet.height / sheet.width)), Image.LANCZOS)
    sheet.save(out, quality=91)
    print(out, sheet.size)
