#!/usr/bin/env python3
"""Render a turntable calibration target, so the 360 viewer can be verified
end to end before any knife has been shot on a real rig.

This is deliberately a machined test block and not a knife. Inventing a knife —
by rendering, by generation, or by any other means — would put a product on the
site that nobody ever made. The block exists only to prove the frame sequence,
the drag mapping and the loader are correct, and it is never shown in
production: the viewer only reaches for it behind ?spin=rig-test.

    python3 scripts/build-spin-rig-test.py
"""

from __future__ import annotations

import os

import numpy as np
from PIL import Image, ImageDraw

OUT = "public/images/spin/rig-test"
FRAMES = 36
W = H = 900
SS = 2                      # supersample factor, for clean edges


def block_mesh():
    """A stepped block with a keyway and a chamfered corner — asymmetric on
    every axis, so which way it is facing is never ambiguous."""
    verts, faces = [], []

    def box(cx, cy, cz, sx, sy, sz, shade):
        i = len(verts)
        for dx in (-1, 1):
            for dy in (-1, 1):
                for dz in (-1, 1):
                    verts.append((cx + dx * sx, cy + dy * sy, cz + dz * sz))
        # 6 quads as 12 triangles, indices into the 8 corners just added
        quads = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1),
                 (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
        for q in quads:
            a, b, c, d = (i + n for n in q)
            faces.append((a, b, c, shade))
            faces.append((a, c, d, shade))

    box(0, 0, 0, 1.0, 0.30, 0.62, 1.00)          # main body
    box(0, 0.42, 0, 0.55, 0.14, 0.40, 0.88)      # raised step
    box(-0.72, -0.10, 0.34, 0.18, 0.16, 0.18, 0.72)   # index lug
    box(0.86, 0.05, -0.20, 0.12, 0.22, 0.30, 0.80)    # keyway rib
    return np.array(verts, dtype=np.float32), faces


def render(angle_deg: int) -> Image.Image:
    verts, faces = block_mesh()
    t = np.radians(angle_deg)
    rot = np.array([[np.cos(t), 0, np.sin(t)],
                    [0, 1, 0],
                    [-np.sin(t), 0, np.cos(t)]], dtype=np.float32)
    tilt = np.radians(-14.0)                      # slight look-down
    rx = np.array([[1, 0, 0],
                   [0, np.cos(tilt), -np.sin(tilt)],
                   [0, np.sin(tilt), np.cos(tilt)]], dtype=np.float32)
    p = verts @ rot.T @ rx.T

    sw, sh = W * SS, H * SS
    scale = sw * 0.30
    xs = p[:, 0] * scale + sw / 2
    ys = -p[:, 1] * scale + sh / 2
    zs = p[:, 2]

    colour = np.zeros((sh, sw, 3), dtype=np.float32)
    alpha = np.zeros((sh, sw), dtype=np.float32)
    zbuf = np.full((sh, sw), -1e9, dtype=np.float32)

    light = np.array([-0.5, 0.75, 0.45], dtype=np.float32)
    light /= np.linalg.norm(light)

    yy, xx = np.mgrid[0:sh, 0:sw].astype(np.float32)

    for a, b, c, shade in faces:
        tri = np.array([[xs[a], ys[a]], [xs[b], ys[b]], [xs[c], ys[c]]], dtype=np.float32)
        n3 = np.cross(p[b] - p[a], p[c] - p[a])
        nl = np.linalg.norm(n3)
        if nl < 1e-8:
            continue
        n3 = n3 / nl
        if n3[2] <= 0:                            # back face
            continue

        x0 = max(int(tri[:, 0].min()) - 1, 0); x1 = min(int(tri[:, 0].max()) + 2, sw)
        y0 = max(int(tri[:, 1].min()) - 1, 0); y1 = min(int(tri[:, 1].max()) + 2, sh)
        if x1 <= x0 or y1 <= y0:
            continue

        sx = xx[y0:y1, x0:x1]; sy = yy[y0:y1, x0:x1]
        d = ((tri[1, 1] - tri[2, 1]) * (tri[0, 0] - tri[2, 0]) +
             (tri[2, 0] - tri[1, 0]) * (tri[0, 1] - tri[2, 1]))
        if abs(d) < 1e-8:
            continue
        w0 = ((tri[1, 1] - tri[2, 1]) * (sx - tri[2, 0]) +
              (tri[2, 0] - tri[1, 0]) * (sy - tri[2, 1])) / d
        w1 = ((tri[2, 1] - tri[0, 1]) * (sx - tri[2, 0]) +
              (tri[0, 0] - tri[2, 0]) * (sy - tri[2, 1])) / d
        w2 = 1.0 - w0 - w1
        inside = (w0 >= 0) & (w1 >= 0) & (w2 >= 0)
        if not inside.any():
            continue

        z = w0 * zs[a] + w1 * zs[b] + w2 * zs[c]
        win = inside & (z > zbuf[y0:y1, x0:x1])
        if not win.any():
            continue

        lam = max(float(np.dot(n3, light)), 0.0)
        view = np.array([0, 0, 1], dtype=np.float32)
        half = light + view
        half /= np.linalg.norm(half)
        spec = max(float(np.dot(n3, half)), 0.0) ** 42
        base = np.array([0.42, 0.44, 0.47], dtype=np.float32) * shade
        px = base * (0.16 + 0.86 * lam) + np.array([1.0, 0.96, 0.88]) * spec * 0.65

        region_c = colour[y0:y1, x0:x1]
        region_c[win] = px
        zb = zbuf[y0:y1, x0:x1]; zb[win] = z[win]
        al = alpha[y0:y1, x0:x1]; al[win] = 1.0

    out = np.zeros((sh, sw, 4), dtype=np.uint8)
    out[..., :3] = (np.clip(colour, 0, 1) * 255).astype(np.uint8)
    out[..., 3] = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    img = Image.fromarray(out, "RGBA").resize((W, H), Image.LANCZOS)

    d = ImageDraw.Draw(img)
    d.text((18, 18), f"RIG TEST  {angle_deg:03d}°", fill=(190, 175, 150, 220))
    return img


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for i in range(FRAMES):
        img = render(round(i * 360 / FRAMES))
        path = f"{OUT}/frame-{i:03d}.webp"
        img.save(path, "WEBP", quality=82, method=6)
        total += os.path.getsize(path)
    print(f"{FRAMES} frames -> {OUT}  ({total/1024:.0f} KB total, "
          f"{total/FRAMES/1024:.1f} KB each)")


if __name__ == "__main__":
    main()
