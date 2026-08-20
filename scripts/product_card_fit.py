"""Fit product photos for shop cards — full knife profile, ~80% frame coverage."""

from __future__ import annotations

from PIL import Image, ImageEnhance, ImageFilter

TARGET_W = 900
TARGET_H = 1200
CARD_BG = (13, 12, 10)  # toros-charcoal
COVERAGE = 1.0


def enhance(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Brightness(img).enhance(1.06)
    img = ImageEnhance.Contrast(img).enhance(1.08)
    img = ImageEnhance.Color(img).enhance(1.04)
    return img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=90, threshold=2))


def fit_card_contain(img: Image.Image, coverage: float = COVERAGE) -> Image.Image:
    """Scale image to fit inside the card frame without cropping the subject."""
    max_w = int(TARGET_W * coverage)
    max_h = int(TARGET_H * coverage)
    iw, ih = img.size
    scale = min(max_w / iw, max_h / ih)
    new_w = max(1, int(iw * scale))
    new_h = max(1, int(ih * scale))
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (TARGET_W, TARGET_H), CARD_BG)
    canvas.paste(resized, ((TARGET_W - new_w) // 2, (TARGET_H - new_h) // 2))
    return canvas


def expand_box(
    box: tuple[int, int, int, int],
    img_size: tuple[int, int],
    margin: float = 0.1,
) -> tuple[int, int, int, int]:
    left, top, right, bottom = box
    w, h = right - left, bottom - top
    pad_w = int(w * margin)
    pad_h = int(h * margin)
    iw, ih = img_size
    return (
        max(0, left - pad_w),
        max(0, top - pad_h),
        min(iw, right + pad_w),
        min(ih, bottom + pad_h),
    )
