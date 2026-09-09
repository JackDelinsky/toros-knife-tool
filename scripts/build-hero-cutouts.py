#!/usr/bin/env python3
"""Build transparent hero cutouts for the seven featured knives.

Masking only — the real photograph's pixels are preserved. Nothing is redrawn,
repainted, or generated. Each source is letterbox-trimmed, optionally cropped to
a single chosen subject (several sources show multiple variants or a sheath),
then background-removed with u2net and reduced to its largest solid component.

Outputs land in public/images/hero/knives/{slug}.png; originals are untouched.
"""

from __future__ import annotations

import io
import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy.ndimage import binary_closing, label

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public/images/hero/knives"

# Sub-crop is expressed as fractions of the letterbox-trimmed content box.
# `keep` selects how many separate components to retain: several sources show a
# knife resting on its sheath (one merged subject) or a row of colourways.
@dataclass(frozen=True)
class Subject:
    slug: str
    crop: tuple[float, float, float, float]
    keep: int
    note: str
    upscale: int = 1


SUBJECTS: list[Subject] = [
    Subject("toros-jellybean", (0.40, 0.00, 0.566, 1.00), 1,
            "Source shows three colourways; the teal/blue knife is the hero subject. "
            "Smallest source region of the seven — upscaled 2x, flagged for reshoot.",
            upscale=2),
    Subject("bos-stag-golden-horn", (0.00, 0.00, 1.00, 1.00), 1,
            "Knife rests on its sheath; kept as the single merged subject."),
    Subject("sakra-bear-claw-neck-knives", (0.28, 0.30, 0.92, 1.00), 1,
            "Source shows five colourways; front knife chosen as hero subject."),
    Subject("misty-stubby-giraffe", (0.00, 0.00, 1.00, 1.00), 1,
            "Single knife, thuya burl handle."),
    Subject("misty-rebar-shank", (0.00, 0.00, 1.00, 1.00), 1,
            "Knife with twisted rebar handle, resting on sheath."),
    Subject("gur-tuva", (0.00, 0.00, 1.00, 1.00), 1,
            "Knife resting on sheath."),
    Subject("gur-tombik", (0.00, 0.00, 1.00, 1.00), 1,
            "Knife resting on sheath."),
]

PAD = 16
LETTERBOX_LUMA = 18  # rows/cols darker than this are treated as padding


def content_box(img: Image.Image) -> tuple[int, int, int, int]:
    """Trim the baked-in black letterboxing around the photo."""
    grey = np.array(img.convert("L"), dtype=np.int16)
    rows = np.where(grey.mean(axis=1) > LETTERBOX_LUMA)[0]
    cols = np.where(grey.mean(axis=0) > LETTERBOX_LUMA)[0]
    if rows.size == 0 or cols.size == 0:
        return (0, 0, img.width, img.height)
    return (int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1)


def largest_components(alpha: np.ndarray, keep: int) -> np.ndarray:
    solid = binary_closing(alpha > 90, structure=np.ones((5, 5)))
    labeled, count = label(solid)
    if count == 0:
        raise RuntimeError("background removal produced an empty mask")
    areas = [(int((labeled == i).sum()), i) for i in range(1, count + 1)]
    areas.sort(reverse=True)
    mask = np.zeros_like(alpha)
    for _, index in areas[:keep]:
        mask[labeled == index] = alpha[labeled == index]
    return mask


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    session = new_session("u2net", providers=["CPUExecutionProvider"])
    report = []

    for subject in SUBJECTS:
        src = ROOT / f"public/images/products/{subject.slug}/main.jpg"
        img = Image.open(src)
        source_size = img.size

        cx0, cy0, cx1, cy1 = content_box(img)
        cw, ch = cx1 - cx0, cy1 - cy0
        fx0, fy0, fx1, fy1 = subject.crop
        box = (
            cx0 + int(cw * fx0), cy0 + int(ch * fy0),
            cx0 + int(cw * fx1), cy0 + int(ch * fy1),
        )
        cropped = img.crop(box).convert("RGB")

        buf = io.BytesIO()
        cropped.save(buf, format="PNG")
        cut = Image.open(io.BytesIO(remove(buf.getvalue(), session=session))).convert("RGBA")

        alpha = np.array(cut.split()[3])
        cut.putalpha(Image.fromarray(largest_components(alpha, subject.keep)))

        bbox = cut.split()[3].getbbox()
        if not bbox:
            raise RuntimeError(f"{subject.slug}: empty mask after component filter")
        cut = cut.crop((
            max(bbox[0] - PAD, 0), max(bbox[1] - PAD, 0),
            min(bbox[2] + PAD, cut.width), min(bbox[3] + PAD, cut.height),
        ))

        if subject.upscale > 1:
            # Conservative Lanczos resample only — no detail is invented.
            cut = cut.resize(
                (cut.width * subject.upscale, cut.height * subject.upscale),
                Image.LANCZOS,
            )

        out = OUT_DIR / f"{subject.slug}.png"
        cut.save(out)

        a = np.array(cut.split()[3])
        report.append({
            "slug": subject.slug,
            "source": str(src.relative_to(ROOT)),
            "sourceSize": f"{source_size[0]}x{source_size[1]}",
            "contentBox": f"{cw}x{ch}",
            "output": str(out.relative_to(ROOT)),
            "outputSize": f"{cut.width}x{cut.height}",
            "coverage": round(float((a > 20).mean()), 3),
            "softEdgePx": int(((a > 20) & (a < 235)).sum()),
            "note": subject.note,
        })
        print(f"{subject.slug}: {cut.width}x{cut.height} coverage={report[-1]['coverage']}")

    (ROOT / "scripts/_hero_cutout_report.json").write_text(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
