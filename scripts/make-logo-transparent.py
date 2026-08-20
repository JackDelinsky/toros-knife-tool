#!/usr/bin/env python3
"""Process Toros logo — remove black background, keep red/white emblem only."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS_SOURCE = ROOT / "assets/brand/logo-source.png"
LOGO = ROOT / "public/images/brand/logo.png"
ICON = ROOT / "app/icon.png"
CURSOR_IMAGES = Path.home() / "Library/Application Support/Cursor/User/workspaceStorage/empty-window/images"
BLACK_THRESHOLD = 35


def find_latest_chat_logo() -> Path | None:
    matches = sorted(CURSOR_IMAGES.glob("ChatGPT Image*.png"), key=lambda p: p.stat().st_mtime, reverse=True)
    return matches[0] if matches else None


def resolve_source() -> Path:
    if ASSETS_SOURCE.exists():
        return ASSETS_SOURCE
    latest = find_latest_chat_logo()
    if latest:
        ASSETS_SOURCE.parent.mkdir(parents=True, exist_ok=True)
        ASSETS_SOURCE.write_bytes(latest.read_bytes())
        return ASSETS_SOURCE
    raise FileNotFoundError("No logo source found. Add assets/brand/logo-source.png")


def remove_edge_black(img: Image.Image) -> Image.Image:
    """Flood-fill black connected to image edges (outer square padding)."""
    w, h = img.size
    pixels = img.load()
    bg: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque()

    def is_black(r: int, g: int, b: int) -> bool:
        return max(r, g, b) < BLACK_THRESHOLD

    for x in range(w):
        for y in (0, h - 1):
            if is_black(*pixels[x, y][:3]):
                bg.add((x, y))
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if (x, y) not in bg and is_black(*pixels[x, y][:3]):
                bg.add((x, y))
                q.append((x, y))

    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in bg:
                if is_black(*pixels[nx, ny][:3]):
                    bg.add((nx, ny))
                    q.append((nx, ny))

    out = img.copy()
    out_pixels = out.load()
    for x, y in bg:
        r, g, b, _ = out_pixels[x, y]
        out_pixels[x, y] = (r, g, b, 0)
    return out


def remove_inner_black(img: Image.Image) -> Image.Image:
    """Remove black fill inside the emblem so only red/white artwork remains."""
    out = img.copy()
    pixels = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 0 and max(r, g, b) < BLACK_THRESHOLD:
                pixels[x, y] = (r, g, b, 0)
    return out


def process_logo(source: Path) -> Image.Image:
    img = Image.open(source).convert("RGBA")
    img = remove_edge_black(img)
    img = remove_inner_black(img)
    return img


def main() -> None:
    source = resolve_source()
    result = process_logo(source)
    result.save(LOGO, optimize=True)
    result.save(ICON, optimize=True)
    print(f"Source: {source}")
    print(f"Updated: {LOGO} ({result.size[0]}x{result.size[1]})")
    print(f"Updated: {ICON}")


if __name__ == "__main__":
    main()
