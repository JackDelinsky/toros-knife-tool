#!/usr/bin/env python3
"""Export founder photos from high-quality source images."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets/brand/about"
OUT_DIR = ROOT / "public/images/brand/about"
COMPOSITE = ASSETS / "composite-hq.png"
BANNER = ASSETS / "banner-hq.png"
JELLYBEAN_SRC = ASSETS / "jellybean-display-hq.png"
# Fallback: mobile screenshot crop prefix
JELLYBEAN_SCREENSHOT_PREFIX = "IMG_6758"
CURSOR_IMAGES = Path.home() / "Library/Application Support/Cursor/User/workspaceStorage/empty-window/images"
REF_WIDTH = 470
JELLYBEAN_BOX = (0, 436, 470, 719)


def export_jellybean_from_screenshot(out_dir: Path) -> None:
    matches = sorted(CURSOR_IMAGES.glob(f"{JELLYBEAN_SCREENSHOT_PREFIX}*.png"))
    if not matches:
        return
    with Image.open(matches[0]) as img:
        scale = img.width / REF_WIDTH
        box = tuple(int(v * scale) for v in JELLYBEAN_BOX)
        cropped = img.crop(box)
        cropped.save(out_dir / "jellybean-display.jpg", quality=92, optimize=True)
        print(f"jellybean-display.jpg: {cropped.size} (screenshot fallback)")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    if not COMPOSITE.exists():
        raise FileNotFoundError(f"Missing composite source: {COMPOSITE}")
    if not BANNER.exists():
        raise FileNotFoundError(f"Missing banner source: {BANNER}")

    with Image.open(COMPOSITE) as composite:
        w, h = composite.size
        split_y = 354
        exports = {
            "international-connection.jpg": composite.crop((512, 0, w, split_y)),
            "bushcraft.jpg": composite.crop((0, split_y + 1, w, h)),
        }
        for name, cropped in exports.items():
            out = OUT_DIR / name
            cropped.save(out, quality=95, optimize=True)
            print(f"{name}: {cropped.size}")

    with Image.open(BANNER) as banner:
        out = OUT_DIR / "banner.jpg"
        banner.save(out, quality=95, optimize=True)
        print(f"banner.jpg: {banner.size}")

    if JELLYBEAN_SRC.exists():
        with Image.open(JELLYBEAN_SRC) as jelly:
            out = OUT_DIR / "jellybean-display.jpg"
            jelly.save(out, quality=95, optimize=True)
            print(f"jellybean-display.jpg: {jelly.size}")
    elif not (OUT_DIR / "jellybean-display.jpg").exists():
        export_jellybean_from_screenshot(OUT_DIR)


if __name__ == "__main__":
    main()
