#!/usr/bin/env python3
"""Extract individual Jellybean knife cutouts from the group product photo."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/product-screenshots/cleaned-png/ChatGPT Image Jun 14, 2026 at 09_18_04 PM.png"
OUT = ROOT / "public/images/mystery/jellybean"
TARGET_HEIGHT = 560


def luminance(r: int, g: int, b: int) -> float:
    return 0.299 * r + 0.587 * g + 0.114 * b


def saturation(r: int, g: int, b: int) -> float:
    mx, mn = max(r, g, b), min(r, g, b)
    return (mx - mn) / mx if mx else 0.0


def is_wood(r: int, g: int, b: int) -> bool:
    lum = luminance(r, g, b)
    s = saturation(r, g, b)
    if lum < 55:
        return True
    if lum < 165 and s < 0.44 and r >= g - 28 and b <= g + 22:
        return True
    return False


def is_background_plank(r: int, g: int, b: int) -> bool:
    lum = luminance(r, g, b)
    s = saturation(r, g, b)
    return lum < 42 or (lum < 95 and s < 0.18)


def is_foliage(r: int, g: int, b: int) -> bool:
    lum = luminance(r, g, b)
    return lum > 45 and g > r + 18 and g > b + 18 and g > 70


def keep_knife_pixel(r: int, g: int, b: int, y: int, crop_height: int) -> bool:
    if is_background_plank(r, g, b):
        return False
    if is_foliage(r, g, b):
        return False
    if y > crop_height * 0.72 and is_wood(r, g, b):
        return False
    if is_wood(r, g, b):
        return False

    lum = luminance(r, g, b)
    s = saturation(r, g, b)
    if lum > 118 and s < 0.28:
        return True
    if s > 0.16 and lum > 52:
        return True
    return False


# Manual crops on 1536×1024 source (x0, y0, x1, y1)
CROPS = {
    "jellybean-red": (395, 70, 575, 650),
    "jellybean-blue": (695, 55, 915, 665),
    "jellybean-green": (995, 55, 1205, 650),
}


def extract_crop(src: Image.Image, crop_box: tuple[int, int, int, int]) -> Image.Image:
    cropped = src.crop(crop_box).convert("RGBA")
    w, h = cropped.size
    pixels = cropped.load()
    alpha = Image.new("L", (w, h), 0)
    alpha_pixels = alpha.load()

    for y in range(h):
        for x in range(w):
            if keep_knife_pixel(*pixels[x, y][:3], y, h):
                alpha_pixels[x, y] = 255

    alpha = alpha.filter(ImageFilter.MaxFilter(3))
    alpha = alpha.filter(ImageFilter.MinFilter(3))
    alpha = alpha.filter(ImageFilter.GaussianBlur(1.0))
    cropped.putalpha(alpha)
    return trim_transparent(cropped)


def trim_transparent(img: Image.Image, padding: int = 12) -> Image.Image:
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


def scale_to_height(img: Image.Image, height: int) -> Image.Image:
    if img.height <= height:
        return img
    ratio = height / img.height
    new_w = max(1, int(img.width * ratio))
    return img.resize((new_w, height), Image.Resampling.LANCZOS)


def compose_group(knives: dict[str, Image.Image]) -> Image.Image:
    order = ["jellybean-red", "jellybean-blue", "jellybean-green"]
    gap = 18
    total_w = sum(knives[name].width for name in order) + gap * (len(order) - 1)
    max_h = max(knives[name].height for name in order)
    canvas = Image.new("RGBA", (total_w, max_h), (0, 0, 0, 0))

    x = 0
    for name in order:
        knife = knives[name]
        y = (max_h - knife.height) // 2
        canvas.paste(knife, (x, y), knife)
        x += knife.width + gap

    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC).convert("RGB")
    knives: dict[str, Image.Image] = {}

    for name, crop_box in CROPS.items():
        knife = scale_to_height(extract_crop(src, crop_box), TARGET_HEIGHT)
        out_path = OUT / f"{name}.png"
        knife.save(out_path, "PNG", optimize=True)
        knives[name] = knife
        print(f"saved {out_path.name} {knife.size}")

    group = compose_group(knives)
    group_path = OUT / "jellybean-group.png"
    group.save(group_path, "PNG", optimize=True)
    print(f"saved {group_path.name} {group.size}")


if __name__ == "__main__":
    main()
