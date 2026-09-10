#!/usr/bin/env python3
"""Measure where the blade ends and the handle begins, from colour.

The first attempt used the silhouette's width profile and was not good enough
to ship — see scripts/_anatomy_review. A knife does not reliably narrow at the
guard in a photograph taken at an angle, and on a knife resting on its sheath
the silhouette is not the knife at all.

Colour is a far stronger signal. Polished steel is bright and almost
colourless; wood, micarta, antler and resin are darker, warmer, or both. So
this walks the product's principal axis and scores each step for how much it
looks like bare steel, then puts the split at the sharpest sustained change.

It measures. It does not paint: no pixel of any knife is created or altered
anywhere in this file. Every proposal is drawn for review and only reaches
`lib/product-media.ts` once it has been looked at.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS = ROOT / "public/images/products"
REVIEW = Path(__file__).resolve().parent / "_anatomy_review2"
REPORT = Path(__file__).resolve().parent / "_anatomy_split_report.json"

BINS = 120


def steeliness(rgb: np.ndarray) -> np.ndarray:
    """0..1 per pixel: bright and unsaturated reads as bare steel."""
    a = rgb.astype(np.float64) / 255.0
    mx = a.max(axis=-1)
    mn = a.min(axis=-1)
    sat = np.where(mx > 1e-6, (mx - mn) / np.maximum(mx, 1e-6), 0.0)
    return np.clip(mx, 0, 1) * (1.0 - np.clip(sat * 2.2, 0, 1))


def measure(path: Path) -> dict:
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    alpha = arr[:, :, 3]
    ys, xs = np.nonzero(alpha > 120)
    if xs.size < 500:
        return {"ok": False, "reason": "mask too small"}

    pts = np.stack([xs, ys]).astype(np.float64)
    centre = pts.mean(axis=1, keepdims=True)
    centred = pts - centre
    cov = centred @ centred.T / centred.shape[1]
    evals, evecs = np.linalg.eigh(cov)
    u = evecs[:, int(np.argmax(evals))]
    v = np.array([-u[1], u[0]])

    t = centred.T @ u
    t0, t1 = float(t.min()), float(t.max())
    steel = steeliness(arr[ys, xs, :3])

    edges = np.linspace(t0, t1, BINS + 1)
    idx = np.clip(np.digitize(t, edges) - 1, 0, BINS - 1)
    prof = np.zeros(BINS)
    for b in range(BINS):
        sel = steel[idx == b]
        prof[b] = sel.mean() if sel.size > 8 else np.nan
    # carry the last good value across empty bins rather than reading them as 0
    good = ~np.isnan(prof)
    prof = np.interp(np.arange(BINS), np.arange(BINS)[good], prof[good])
    prof = np.convolve(prof, np.ones(7) / 7, mode="same")

    # Orient handle -> tip: the steel end is the blade.
    if prof[: BINS // 3].mean() > prof[-BINS // 3 :].mean():
        u, v, prof = -u, -v, prof[::-1]
        t0, t1 = -t1, -t0

    # The split is the steepest rise into steel, searched away from both ends.
    lo, hi = int(BINS * 0.15), int(BINS * 0.85)
    grad = np.gradient(prof)
    b = int(np.argmax(grad[lo:hi])) + lo
    contrast = float(prof[-BINS // 4 :].mean() - prof[: BINS // 4].mean())

    t_split = t0 + (b + 0.5) * (t1 - t0) / BINS
    cx, cy = float(centre[0, 0]), float(centre[1, 0])
    px, py = cx + t_split * u[0], cy + t_split * u[1]
    h, w = alpha.shape
    return {
        "ok": True,
        "width": w,
        "height": h,
        "axis": [round(float(u[0]), 4), round(float(u[1]), 4)],
        "cross": [round(float(v[0]), 4), round(float(v[1]), 4)],
        "point": [round(px / w, 4), round(py / h, 4)],
        "handleFraction": round(float((t_split - t0) / (t1 - t0)), 3),
        "steelContrast": round(contrast, 3),
        "profile": [round(float(x), 3) for x in prof[::6]],
    }



# ---------------------------------------------------------------------------
# Hand-set corrections.
#
# Colour finds the split on its own wherever steel meets a darker or warmer
# handle. Two products defeat it and were set by eye instead, from the
# candidate lines in scripts/_anatomy_review2:
#
#   bos-tera  white paper micarta is nearly as bright and as colourless as the
#             blade, so there is no colour step to find.
#   kam-ram   a folder whose steel back-spring runs the length of the handle,
#             which makes the handle end read as the steel end and inverts the
#             measured direction.
#
# `f` is the fraction of the principal axis, measured from the end the
# algorithm called the handle; `flip` says that end was actually the tip.
OVERRIDES: dict[str, tuple[float, bool]] = {
    "bos-tera": (0.40, False),
    "kam-ram": (0.64, True),
}


def apply_override(geom: dict, path: Path, f: float, flip: bool) -> dict:
    """Recompute the cut line from a hand-chosen position along the axis."""
    alpha = np.array(Image.open(path).convert("RGBA"))[:, :, 3]
    ys, xs = np.nonzero(alpha > 120)
    pts = np.stack([xs, ys]).astype(np.float64)
    centre = pts.mean(axis=1)
    u = np.array(geom["axis"], dtype=np.float64)
    t = (pts.T - centre) @ u
    t_split = float(t.min() + f * (t.max() - t.min()))
    px, py = centre[0] + t_split * u[0], centre[1] + t_split * u[1]
    h, w = alpha.shape
    v = np.array(geom["cross"], dtype=np.float64)
    if flip:
        u, v = -u, -v
    out = dict(geom)
    out.update({
        "axis": [round(float(u[0]), 4), round(float(u[1]), 4)],
        "cross": [round(float(v[0]), 4), round(float(v[1]), 4)],
        "point": [round(px / w, 4), round(py / h, 4)],
        "handleFraction": round(1 - f if flip else f, 3),
        "handSet": True,
    })
    return out


def draw(path: Path, geom: dict, slug: str) -> None:
    im = Image.open(path).convert("RGBA")
    im = Image.alpha_composite(Image.new("RGBA", im.size, (26, 26, 30, 255)), im)
    d = ImageDraw.Draw(im)
    if geom.get("ok"):
        w, h = im.size
        px, py = geom["point"][0] * w, geom["point"][1] * h
        vx, vy = geom["cross"]
        L = max(w, h)
        d.line([(px - vx * L, py - vy * L), (px + vx * L, py + vy * L)],
               fill=(255, 80, 80, 255), width=4)
        ux, uy = geom["axis"]
        d.line([(px, py), (px + ux * 110, py + uy * 110)], fill=(90, 210, 255, 255), width=4)
        d.text((10, 10), f"{slug}  f={geom['handleFraction']} contrast={geom['steelContrast']}",
               fill=(255, 255, 255, 255))
    REVIEW.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(REVIEW / f"{slug}.png")


def main(slugs: list[str]) -> None:
    out = {}
    for slug in slugs:
        p = PRODUCTS / slug / "cutout.png"
        if not p.exists():
            print(f"  {slug}: no cutout")
            continue
        g = measure(p)
        if slug in OVERRIDES and g.get("ok"):
            g = apply_override(g, p, *OVERRIDES[slug])
        draw(p, g, slug)
        out[slug] = g
        print(f"  {slug}: f={g.get('handleFraction')} contrast={g.get('steelContrast')}")
    REPORT.write_text(json.dumps(out, indent=2) + "\n")
    print(f"wrote {REPORT.relative_to(ROOT)}")


if __name__ == "__main__":
    args = sys.argv[1:] or sorted(
        p.name for p in PRODUCTS.iterdir() if (p / "cutout.png").exists()
    )
    main(args)
