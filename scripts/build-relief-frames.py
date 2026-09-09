#!/usr/bin/env python3
"""Derive a short parallax sweep from a single product photograph.

    python3 scripts/build-relief-frames.py <slug> public/images/spin/<slug>

A knife is close to a flat plate, so a distance transform of its own silhouette
is a serviceable stand-in for thickness: thickest down the middle of the form,
tapering to nothing at every edge. Displace the photograph's real pixels by
that relief, rotate, and you get genuine parallax — the handle turns, the
highlight travels, the near edge occludes the far one.

What this is not:

- It is not a 360. The arc is capped at +/-24 degrees and the viewer clamps
  there. The far side of the knife was never photographed and nothing here
  invents it.
- The relief is estimated, not measured. It is plausible thickness, not this
  knife's thickness.
- No pixel is generated. Every colour on screen came off the camera; the only
  thing added is where those pixels sit in depth.

A real turntable shoot replaces this entirely and should — see
docs/360-capture-guide.md. This exists so the knives feel solid in the meantime,
without putting a product on the site that nobody made.
"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, gaussian_filter, grey_closing

def build(slug, out_prefix, max_deg=24.0, frames=17, thickness=0.035, ss=2):
    im = Image.open(f"public/images/hero/knives/{slug}.png").convert("RGBA")
    a = np.asarray(im).astype(np.float32) / 255.0
    rgb, alpha = a[..., :3], a[..., 3]
    h, w = alpha.shape

    mask = alpha > 0.55
    # Distance from the silhouette edge -> a ridge down the middle of the form.
    d = distance_transform_edt(mask).astype(np.float32)
    if d.max() < 1:
        raise SystemExit("empty mask")
    depth = (d / d.max()) ** 0.62
    depth = gaussian_filter(depth, 3.0) * (thickness * max(w, h))

    # Surface normals from the relief, for a highlight that moves with the tilt.
    gy, gx = np.gradient(gaussian_filter(depth, 2.0))
    nz = np.ones_like(depth)
    nlen = np.sqrt(gx * gx + gy * gy + nz * nz)
    nx, ny, nz = -gx / nlen, -gy / nlen, nz / nlen

    cx = w / 2.0
    X = np.tile(np.arange(w, dtype=np.float32), (h, 1))
    Y = np.tile(np.arange(h, dtype=np.float32)[:, None], (1, w))
    ys, xs = np.nonzero(mask)
    src_rgb = rgb[ys, xs]
    src_a = alpha[ys, xs]
    z0 = depth[ys, xs]
    x0 = X[ys, xs] - cx
    nxv, nyv, nzv = nx[ys, xs], ny[ys, xs], nz[ys, xs]

    sizes = []
    for i in range(frames):
        t = (i / (frames - 1)) * 2 - 1           # -1 .. 1
        ang = np.radians(t * max_deg)
        c, s = np.cos(ang), np.sin(ang)

        xr = x0 * c + z0 * s
        zr = -x0 * s + z0 * c

        # light swings opposite the rotation, so the highlight travels
        lx, ly, lz = -0.45 * c + 0.5 * s, -0.6, 0.65
        ln = np.sqrt(lx * lx + ly * ly + lz * lz)
        lam = np.clip((nxv * lx + nyv * ly + nzv * lz) / ln, 0, 1)
        shade = (0.86 + 0.28 * lam)[:, None]

        ow, oh = w * ss, h * ss
        acc = np.zeros((oh, ow, 3), dtype=np.float32)
        aacc = np.zeros((oh, ow), dtype=np.float32)
        zb = np.full((oh, ow), -1e9, dtype=np.float32)

        px = np.rint((cx + xr) * ss).astype(np.int64)
        py = np.rint(Y[ys, xs] * ss).astype(np.int64)
        ok = (px >= 0) & (px < ow) & (py >= 0) & (py < oh)
        px, py = px[ok], py[ok]
        zz, cc, aa = zr[ok], np.clip(src_rgb[ok] * shade[ok], 0, 1), src_a[ok]

        order = np.argsort(zz)                    # far to near, near overwrites
        px, py, cc, aa = px[order], py[order], cc[order], aa[order]
        acc[py, px] = cc
        aacc[py, px] = aa
        zb[py, px] = zz[order]

        # close the 1px gaps rotation opens up between splats
        aacc = grey_closing(aacc, size=(ss + 1, ss + 1))
        for ch in range(3):
            acc[..., ch] = grey_closing(acc[..., ch], size=(ss + 1, ss + 1))

        out = np.zeros((oh, ow, 4), dtype=np.uint8)
        out[..., :3] = (np.clip(acc, 0, 1) * 255).astype(np.uint8)
        out[..., 3] = (np.clip(aacc, 0, 1) * 255).astype(np.uint8)
        # Cap the shipped size: the hero shows this at ~450px, the closer look
        # at ~640px, so 900px on the long side is already generous.
        tw, th = w, h
        if max(w, h) > 900:
            k = 900 / max(w, h)
            tw, th = int(w * k), int(h * k)
        img = Image.fromarray(out, "RGBA").resize((tw, th), Image.LANCZOS)
        path = f"{out_prefix}/frame-{i:03d}.webp"
        img.save(path, "WEBP", quality=78, method=6)
        sizes.append(path)
    return sizes

if __name__ == "__main__":
    import os
    slug = sys.argv[1]
    out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    fs = build(slug, out)
    total = sum(os.path.getsize(f) for f in fs)
    print(f"{len(fs)} frames, {total/1024:.0f} KB total, {total/len(fs)/1024:.1f} KB each")
