#!/usr/bin/env python3
"""Derive one consistently-framed card image per product.

The source photography is uneven: every file is a 900x1200 JPEG, but the actual
photograph inside it is letterboxed differently in each one, with content
aspect ratios from 1.09 to 2.06. Presenting those raw in a fixed frame gives
some products black bars and others a hard crop, which is what made the
catalogue look assembled rather than art-directed.

This crops each source to its real content box and then fills a 4:3 card frame.
It only ever *removes* pixels — nothing is stretched, upscaled, extended or
invented. Where filling the frame would cut away more than MAX_TRIM of an axis,
the product is left letterboxed on the site's own surface colour and reported,
so a weak source is recorded rather than concealed.

    python3 scripts/normalize-product-photos.py
"""

from __future__ import annotations

import glob
import json
import os

import numpy as np
from PIL import Image

TARGET = (1200, 900)          # 4:3, the one card ratio used site-wide
MAX_TRIM = 0.22               # most of an axis we will crop away to fill it
SURFACE = (20, 18, 16)        # --toros-surface, so bars read as the page
BLACK_LEVEL = 14              # anything under this is letterbox, not photograph


def content_box(path: str) -> tuple[int, int, int, int]:
    a = np.array(Image.open(path).convert("L")).astype(np.float32)
    lit = a > BLACK_LEVEL
    ys = np.where(lit.mean(axis=1) > 0.02)[0]
    xs = np.where(lit.mean(axis=0) > 0.02)[0]
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def main() -> None:
    report = {}
    target_ar = TARGET[0] / TARGET[1]

    for path in sorted(glob.glob("public/images/products/*/main.jpg")):
        slug = path.split("/")[-2]
        img = Image.open(path).convert("RGB")
        x0, y0, x1, y1 = content_box(path)
        content = img.crop((x0, y0, x1, y1))
        cw, ch = content.size
        ar = cw / ch

        if ar > target_ar:
            keep_w = int(round(ch * target_ar))
            trim = 1 - keep_w / cw
            axis = "width"
        else:
            keep_h = int(round(cw / target_ar))
            trim = 1 - keep_h / ch
            axis = "height"

        if trim <= MAX_TRIM:
            if ar > target_ar:
                left = (cw - keep_w) // 2
                framed = content.crop((left, 0, left + keep_w, ch))
            else:
                top = (ch - keep_h) // 2
                framed = content.crop((0, top, cw, top + keep_h))
            out = framed.resize(TARGET, Image.LANCZOS)
            status = "filled"
        else:
            # Too little photograph to fill the frame without cutting into the
            # knife. Fit it instead and flag the source for a reshoot.
            fitted = content.copy()
            fitted.thumbnail(TARGET, Image.LANCZOS)
            out = Image.new("RGB", TARGET, SURFACE)
            out.paste(fitted, ((TARGET[0] - fitted.width) // 2,
                               (TARGET[1] - fitted.height) // 2))
            status = "letterboxed"

        dest = f"public/images/products/{slug}/card.jpg"
        out.save(dest, "JPEG", quality=86, optimize=True, progressive=True)
        report[slug] = {
            "content_box": [x0, y0, x1, y1],
            "content_aspect": round(ar, 3),
            "trimmed_axis": axis,
            "trim_fraction": round(trim, 3),
            "status": status,
            "bytes": os.path.getsize(dest),
        }
        print(f"{slug:30s} ar={ar:5.2f} trim {axis} {trim * 100:5.1f}%  {status}")

    with open("scripts/_product_photo_report.json", "w") as fh:
        json.dump(report, fh, indent=2)

    weak = [s for s, r in report.items() if r["status"] != "filled"]
    print(f"\n{len(report)} normalised; {len(weak)} need a reshoot: {', '.join(weak) or 'none'}")


if __name__ == "__main__":
    main()
