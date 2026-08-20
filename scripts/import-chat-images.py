#!/usr/bin/env python3
"""Import unique Toros images from Cursor chat storage into assets/product-screenshots."""

from __future__ import annotations

import hashlib
import shutil
from pathlib import Path

from PIL import Image

CURSOR_IMAGES = Path.home() / "Library/Application Support/Cursor/User/workspaceStorage/empty-window/images"
DOWNLOADS = Path.home() / "Downloads"
ASSETS = Path(__file__).resolve().parent.parent / "assets/product-screenshots"
SCREENSHOTS_DIR = ASSETS
CHAT_SCREENSHOTS_DIR = ASSETS / "chat-screenshots"
PRODUCT_PHOTOS_DIR = ASSETS / "product-photos"
CLEANED_PNG_DIR = ASSETS / "cleaned-png"


def phash(img: Image.Image, size: int = 32) -> str:
    small = img.resize((size, size)).convert("L")
    return hashlib.md5(small.tobytes()).hexdigest()


def load_existing_hashes() -> set[str]:
    hashes: set[str] = set()
    for folder in [SCREENSHOTS_DIR, CHAT_SCREENSHOTS_DIR, PRODUCT_PHOTOS_DIR, CLEANED_PNG_DIR]:
        if not folder.exists():
            continue
        for path in folder.iterdir():
            if path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
                continue
            try:
                with Image.open(path) as img:
                    hashes.add(phash(img))
            except Exception:
                pass
    return hashes


def best_per_hash(paths: list[Path]) -> dict[str, tuple[Path, int, int, int]]:
    """Return phash -> (path, w, h, filesize) keeping largest file per hash."""
    best: dict[str, tuple[Path, int, int, int]] = {}
    for path in paths:
        try:
            size = path.stat().st_size
            with Image.open(path) as img:
                w, h = img.size
                hsh = phash(img)
            if hsh not in best or size > best[hsh][3]:
                best[hsh] = (path, w, h, size)
        except Exception:
            pass
    return best


def import_chat_images() -> tuple[int, int]:
    if not CURSOR_IMAGES.exists():
        print(f"Cursor image dir not found: {CURSOR_IMAGES}")
        return 0, 0

    existing = load_existing_hashes()
    CHAT_SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    PRODUCT_PHOTOS_DIR.mkdir(parents=True, exist_ok=True)

    screenshot_candidates: list[Path] = []
    product_candidates: list[Path] = []

    for path in CURSOR_IMAGES.glob("*.png"):
        try:
            size = path.stat().st_size
            with Image.open(path) as img:
                w, h = img.size
            if h > w * 1.25 and w <= 800:
                screenshot_candidates.append(path)
            elif w > h and w >= 800 and h >= 500 and size >= 200000:
                product_candidates.append(path)
        except Exception:
            pass

    ss_best = best_per_hash(screenshot_candidates)
    pp_best = best_per_hash(product_candidates)

    ss_added = 0
    pp_added = 0
    idx = 1

    for hsh, (src, w, h, _) in sorted(ss_best.items(), key=lambda x: x[1][0].name):
        if hsh in existing:
            continue
        dest = CHAT_SCREENSHOTS_DIR / f"chat-screenshot-{idx:03d}.png"
        shutil.copy2(src, dest)
        existing.add(hsh)
        ss_added += 1
        idx += 1
        print(f"screenshot {dest.name} ({w}x{h})")

    idx = 1
    for hsh, (src, w, h, _) in sorted(pp_best.items(), key=lambda x: x[1][0].name):
        if hsh in existing:
            continue
        dest = PRODUCT_PHOTOS_DIR / f"product-photo-{idx:03d}.png"
        shutil.copy2(src, dest)
        existing.add(hsh)
        pp_added += 1
        idx += 1
        print(f"product-photo {dest.name} ({w}x{h})")

    return ss_added, pp_added


def sync_downloads() -> tuple[int, int]:
    """Copy toroskt JPEG screenshots and ChatGPT PNGs if missing."""
    jpeg_added = 0
    png_added = 0

    for src in DOWNLOADS.glob("*.jpeg"):
        try:
            with Image.open(src) as img:
                w, h = img.size
            if w != 706 or h != 1536:
                continue
        except Exception:
            continue
        dest = SCREENSHOTS_DIR / src.name
        if not dest.exists():
            shutil.copy2(src, dest)
            jpeg_added += 1

    CLEANED_PNG_DIR.mkdir(parents=True, exist_ok=True)
    for src in DOWNLOADS.glob("ChatGPT Image Jun 14, 2026 at *.png"):
        dest = CLEANED_PNG_DIR / src.name
        if not dest.exists():
            shutil.copy2(src, dest)
            png_added += 1

    return jpeg_added, png_added


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    j, p = sync_downloads()
    ss, pp = import_chat_images()
    print(f"\nSummary:")
    print(f"  Downloads JPEGs added: {j}")
    print(f"  Downloads ChatGPT PNGs added: {p}")
    print(f"  Chat screenshots added: {ss}")
    print(f"  Chat product photos added: {pp}")
    ss_count = len(list(SCREENSHOTS_DIR.glob("*.jpeg")) + list(CHAT_SCREENSHOTS_DIR.glob("*.png")))
    print(f"  Total screenshots (jpeg + chat): {ss_count}")
    print(f"  Total in product-photos: {len(list(PRODUCT_PHOTOS_DIR.glob('*')))}")
    print(f"  Total in cleaned-png: {len(list(CLEANED_PNG_DIR.glob('*')))}")


if __name__ == "__main__":
    main()
