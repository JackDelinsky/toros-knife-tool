#!/usr/bin/env python3
"""Extract product photos from toroskt.com mobile screenshots — v2."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

DOWNLOADS = Path(__file__).resolve().parent.parent / "assets/product-screenshots"
OUT_DIR = Path(__file__).resolve().parent.parent / "public/images/products"
STAGING = Path(__file__).resolve().parent / "_staging_crops"
META = Path(__file__).resolve().parent / "_staging_meta.json"
TARGET_W, TARGET_H = 900, 1200


def row_stats(img: Image.Image, y: int, left: int, right: int) -> tuple[float, float]:
    pixels = [img.getpixel((x, y)) for x in range(left, right, 4)]
    if not pixels:
        return 1.0, 0.0
    dark = sum(1 for p in pixels if sum(p) < 45) / len(pixels)
    avg = sum(sum(p) for p in pixels) / len(pixels)
    return dark, avg


def is_photo_row(dark: float, avg: float) -> bool:
    return dark < 0.35 and avg > 140


def find_photo_bands(img: Image.Image) -> list[tuple[int, int]]:
    w, h = img.size
    left, right = int(w * 0.06), int(w * 0.94)
    bands: list[tuple[int, int]] = []
    start = None
    for y in range(h):
        dark, avg = row_stats(img, y, left, right)
        if is_photo_row(dark, avg):
            if start is None:
                start = y
        elif start is not None:
            if y - start >= 180:
                bands.append((start, y))
            start = None
    if start is not None and h - start >= 180:
        bands.append((start, h))
    return bands


def horizontal_bounds(img: Image.Image, top: int, bottom: int) -> tuple[int, int]:
    w = img.size[0]
    col_dark = []
    for x in range(w):
        pixels = [img.getpixel((x, y)) for y in range(top, bottom, max(1, (bottom - top) // 50))]
        col_dark.append(sum(1 for p in pixels if sum(p) < 45) / len(pixels))
    left = next(i for i, d in enumerate(col_dark) if d < 0.55)
    right = len(col_dark) - next(i for i, d in enumerate(reversed(col_dark)) if d < 0.55)
    return left, right


def trim_photo_bottom(img: Image.Image, top: int, bottom: int, left: int, right: int) -> int:
    """Remove rows at bottom that look like UI bleed."""
    threshold_rows = 0
    trim = bottom
    for y in range(bottom - 1, top, -1):
        dark, avg = row_stats(img, y, left, right)
        if is_photo_row(dark, avg):
            threshold_rows += 1
            if threshold_rows >= 8:
                trim = y + 1
                break
        else:
            threshold_rows = 0
    return trim


def enhance(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Brightness(img).enhance(1.06)
    img = ImageEnhance.Contrast(img).enhance(1.08)
    img = ImageEnhance.Color(img).enhance(1.04)
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=90, threshold=2))
    return img


def fit_aspect(img: Image.Image) -> Image.Image:
    return ImageOps.fit(img, (TARGET_W, TARGET_H), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def phash(img: Image.Image) -> str:
    small = img.resize((16, 16), Image.Resampling.LANCZOS).convert("L")
    pixels = list(small.getdata())
    avg = sum(pixels) / len(pixels)
    bits = "".join("1" if p > avg else "0" for p in pixels)
    return hashlib.md5(bits.encode()).hexdigest()


def normalize_screenshot(img: Image.Image) -> Image.Image:
    """Scale chat-upload PNGs (470×1024) to match toroskt JPEG dimensions."""
    w, h = img.size
    if w == 706 and h == 1536:
        return img
    if w == 470 and h == 1024:
        return img.resize((706, 1536), Image.Resampling.LANCZOS)
    return img


def process_screenshot(path: Path) -> list[tuple[str, Image.Image, dict]]:
    img = normalize_screenshot(Image.open(path).convert("RGB"))
    w, h = img.size
    if w != 706 or h != 1536:
        return []

    results = []
    bands = find_photo_bands(img)
    for i, (top, bottom) in enumerate(bands):
        left, right = horizontal_bounds(img, top, bottom)
        bottom = trim_photo_bottom(img, top, bottom, left, right)
        if bottom - top < 180 or right - left < 200:
            continue
        crop = img.crop((left, top, right, bottom))
        crop = enhance(fit_aspect(crop))
        hsh = phash(crop)
        meta = {
            "source": path.name,
            "band_index": i,
            "box": [left, top, right, bottom],
        }
        results.append((hsh, crop, meta))
    return results


def main() -> None:
    STAGING.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    unique: dict[str, Image.Image] = {}
    all_meta: dict[str, dict] = {}

    sources = sorted(
        list(DOWNLOADS.glob("*.jpeg")) + list(DOWNLOADS.glob("chat-screenshots/*.png")),
        key=lambda p: p.stat().st_mtime,
    )
    for path in sources:
        for hsh, crop, meta in process_screenshot(path):
            if hsh not in unique:
                unique[hsh] = crop
                all_meta[hsh] = meta

    # clear old staging
    for old in STAGING.glob("*.jpg"):
        old.unlink()

    index = []
    for i, (hsh, crop) in enumerate(unique.items(), start=1):
        fname = f"crop_{i:02d}_{hsh[:8]}.jpg"
        crop.save(STAGING / fname, "JPEG", quality=92, optimize=True)
        index.append({"file": fname, "hash": hsh, **all_meta[hsh]})

    META.write_text(json.dumps(index, indent=2))
    print(f"Unique photo crops: {len(unique)}")
    for item in index:
        print(f"  {item['file']} <- {item['source']} band {item['band_index']}")


if __name__ == "__main__":
    main()
