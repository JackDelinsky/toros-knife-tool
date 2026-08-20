#!/usr/bin/env python3
"""Re-extract full Jellybean knife cutouts from the brand group PNG."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/images/brand/jellybean-knives-transparent.png"
OUT = ROOT / "public/images/mystery/jellybean"

# Column splits on 900×863 brand asset (red | blue | green)
COLUMNS = {
    "jellybean-red": (0, 210),
    "jellybean-blue": (210, 600),
    "jellybean-green": (600, 900),
}

PAD = 16


def trim_alpha(img: Image.Image, padding: int = PAD) -> Image.Image:
    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - padding)
    y0 = max(0, y0 - padding)
    x1 = min(img.width, x1 + padding)
    y1 = min(img.height, y1 + padding)
    return img.crop((x0, y0, x1, y1))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC).convert("RGBA")

    for name, (x0, x1) in COLUMNS.items():
        col = src.crop((x0, 0, x1, src.height))
        knife = trim_alpha(col)
        path = OUT / f"{name}.png"
        knife.save(path, "PNG", optimize=True)
        print(f"saved {path.name} {knife.size}")


if __name__ == "__main__":
    main()
