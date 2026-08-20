#!/usr/bin/env python3
"""Extract the BOS Stag Golden Horn knife for the hero — knife only, transparent."""

from __future__ import annotations

import io
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy.ndimage import label

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/images/products/bos-stag-golden-horn/main.jpg"
OUT = ROOT / "public/images/brand/hero-knife-cutout.png"
LEGACY_OUT = ROOT / "public/images/brand/hero-knife.png"

# Trim letterboxing; keep full knife diagonal.
CROP = (0.05, 0.12, 0.92, 0.88)
MIN_COMPONENT_AREA = 35000


def main() -> None:
    session = new_session("u2net", providers=["CPUExecutionProvider"])

    img = Image.open(SRC)
    w, h = img.size
    x0, y0, x1, y1 = (
        int(w * CROP[0]),
        int(h * CROP[1]),
        int(w * CROP[2]),
        int(h * CROP[3]),
    )
    cropped = img.crop((x0, y0, x1, y1))

    buffer = io.BytesIO()
    cropped.convert("RGB").save(buffer, format="PNG")
    result_bytes = remove(buffer.getvalue(), session=session)
    result = Image.open(io.BytesIO(result_bytes)).convert("RGBA")

    alpha = np.array(result.split()[3])
    labeled, count = label(alpha > 80)

    keep = np.zeros_like(alpha)
    for index in range(1, count + 1):
        area = int((labeled == index).sum())
        if area >= MIN_COMPONENT_AREA:
            keep[labeled == index] = 255

    if not keep.any():
        raise RuntimeError("No knife component found after masking")

    result.putalpha(Image.fromarray(keep))
    trimmed_alpha = result.split()[3]
    bbox = trimmed_alpha.getbbox()
    if not bbox:
        raise RuntimeError("Background removal produced an empty mask")

    pad = 24
    trimmed = result.crop(
        (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(result.width, bbox[2] + pad),
            min(result.height, bbox[3] + pad),
        )
    )

    arr = np.array(trimmed)
    arr[arr[:, :, 3] < 10] = [0, 0, 0, 0]
    trimmed = Image.fromarray(arr)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    trimmed.save(OUT, optimize=True)
    trimmed.save(LEGACY_OUT, optimize=True)
    print(f"saved {OUT} ({trimmed.size})")


if __name__ == "__main__":
    main()
