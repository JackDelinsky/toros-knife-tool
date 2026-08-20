#!/usr/bin/env python3
"""Remove background from the original Jellybean product photo."""

from __future__ import annotations

from pathlib import Path

from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/images/products/toros-jellybean/main.png"
OUT = ROOT / "public/images/brand/jellybean-knives-transparent.png"
GROUP_OUT = ROOT / "public/images/mystery/jellybean/jellybean-group.png"


def main() -> None:
    session = new_session("u2net", providers=["CPUExecutionProvider"])

    with open(SRC, "rb") as source:
        result = remove(source.read(), session=session)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(result)

    img = Image.open(OUT)
    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if not bbox:
        raise RuntimeError("Background removal produced an empty mask")

    pad = 16
    x0, y0, x1, y1 = bbox
    trimmed = img.crop(
        (
            max(0, x0 - pad),
            max(0, y0 - pad),
            min(img.width, x1 + pad),
            min(img.height, y1 + pad),
        )
    )
    trimmed.save(OUT, optimize=True)

    GROUP_OUT.parent.mkdir(parents=True, exist_ok=True)
    trimmed.save(GROUP_OUT, optimize=True)

    print(f"saved {OUT} ({trimmed.size})")
    print(f"saved {GROUP_OUT} ({trimmed.size})")


if __name__ == "__main__":
    main()
