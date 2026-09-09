#!/usr/bin/env python3
"""Turn a raw turntable shoot into web frames for the 360 viewer.

    python3 scripts/build-spin-frames.py <slug> <raw-frame-dir> [--width 1100]

Reads every image in the raw directory in filename order, masks the background,
crops all frames to one shared box, and writes
`public/images/spin/<slug>/frame-000.webp` upward.

The shared crop is the part that matters. Masking each frame to its own bounding
box makes the knife jump around as it turns, because its silhouette is widest
side-on and narrowest end-on. Taking the union of every frame's box and applying
it to all of them keeps the knife pinned in place, which is the difference
between a turntable and a flip-book.

Masking only: the photograph's own pixels are preserved. Nothing is redrawn,
sharpened, upscaled or invented — the same rule the rest of this repository
follows, and the reason the viewer plays photographs instead of rendering a
model.
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import sys

import numpy as np
from PIL import Image

try:
    from rembg import remove, new_session
except ImportError:  # pragma: no cover - tooling hint only
    print("rembg is required:  pip install rembg", file=sys.stderr)
    raise

PAD = 24  # px of breathing room around the union box


def alpha_box(alpha: np.ndarray, threshold: int = 12):
    ys, xs = np.where(alpha > threshold)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("raw_dir")
    ap.add_argument("--width", type=int, default=1100, help="output frame width")
    ap.add_argument("--quality", type=int, default=82)
    args = ap.parse_args()

    raw = []
    for ext in ("jpg", "jpeg", "png", "webp", "tif", "tiff"):
        raw += glob.glob(os.path.join(args.raw_dir, f"*.{ext}"))
        raw += glob.glob(os.path.join(args.raw_dir, f"*.{ext.upper()}"))
    raw = sorted(set(raw))
    if not raw:
        sys.exit(f"no images found in {args.raw_dir}")

    print(f"{len(raw)} raw frames; masking…")
    session = new_session("u2net")
    cut = []
    for i, path in enumerate(raw):
        img = Image.open(path).convert("RGB")
        out = remove(img, session=session, post_process_mask=True).convert("RGBA")
        cut.append(out)
        print(f"  {i + 1}/{len(raw)}  {os.path.basename(path)}", end="\r")
    print()

    # One box for every frame, so the knife does not drift while it turns.
    boxes = [alpha_box(np.array(c)[..., 3]) for c in cut]
    boxes = [b for b in boxes if b]
    if not boxes:
        sys.exit("every frame masked to nothing — check the backdrop contrast")
    x0 = max(min(b[0] for b in boxes) - PAD, 0)
    y0 = max(min(b[1] for b in boxes) - PAD, 0)
    x1 = min(max(b[2] for b in boxes) + PAD, cut[0].width)
    y1 = min(max(b[3] for b in boxes) + PAD, cut[0].height)
    print(f"shared crop {x1 - x0}x{y1 - y0} from {cut[0].width}x{cut[0].height}")

    out_dir = os.path.join("public", "images", "spin", args.slug)
    os.makedirs(out_dir, exist_ok=True)
    for old in glob.glob(os.path.join(out_dir, "frame-*.webp")):
        os.remove(old)

    height = round((y1 - y0) * args.width / (x1 - x0))
    total = 0
    for i, c in enumerate(cut):
        frame = c.crop((x0, y0, x1, y1)).resize((args.width, height), Image.LANCZOS)
        path = os.path.join(out_dir, f"frame-{i:03d}.webp")
        frame.save(path, "WEBP", quality=args.quality, method=6)
        total += os.path.getsize(path)

    report = {
        "slug": args.slug,
        "frames": len(cut),
        "width": args.width,
        "height": height,
        "bytes_total": total,
        "bytes_per_frame": round(total / len(cut)),
        "shared_crop": [x0, y0, x1, y1],
    }
    with open("scripts/_spin_report.json", "w") as fh:
        json.dump(report, fh, indent=2)

    print(f"\nwrote {len(cut)} frames to {out_dir}")
    print(f"  {args.width}x{height}, {total / 1024:.0f} KB total, "
          f"{total / len(cut) / 1024:.1f} KB per frame")
    print("\nAdd to components/home/hero/hero-knives.ts on this knife's entry:\n")
    print(f'    spin: {{ dir: "/images/spin/{args.slug}", frames: {len(cut)}, '
          f'width: {args.width}, height: {height} }},')


if __name__ == "__main__":
    main()
