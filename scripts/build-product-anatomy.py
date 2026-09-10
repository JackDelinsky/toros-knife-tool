#!/usr/bin/env python3
"""Cut out every shop product and propose its blade/handle split.

Masking and measurement only. The real photograph's pixels are preserved:
the cutout is the same image with the background erased, and the "split" is a
straight line measured from the silhouette, not a redrawn part. Nothing here
generates, repaints, or infers any pixel of a knife.

The split is *proposed*, not trusted. Every proposal is drawn onto a review
sheet so it can be looked at and corrected by hand before it reaches the site;
`scripts/_product_anatomy_report.json` is the machine-readable output that
`lib/product-media.ts` is written from.

Outputs:
  public/images/products/{slug}/cutout.png   transparent subject
  scripts/_product_anatomy_report.json       geometry + confidence per product
  scripts/_anatomy_review/{slug}.png         the proposal, drawn
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from rembg import new_session, remove
from scipy.ndimage import binary_closing, label

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS = ROOT / "public/images/products"
REVIEW = Path(__file__).resolve().parent / "_anatomy_review"
REPORT = Path(__file__).resolve().parent / "_product_anatomy_report.json"

LETTERBOX_LUMA = 18
PAD = 12


def content_box(img: Image.Image) -> tuple[int, int, int, int]:
    """Trim the baked-in black letterboxing around the photo."""
    grey = np.array(img.convert("L"), dtype=np.int16)
    rows = np.where(grey.mean(axis=1) > LETTERBOX_LUMA)[0]
    cols = np.where(grey.mean(axis=0) > LETTERBOX_LUMA)[0]
    if rows.size == 0 or cols.size == 0:
        return (0, 0, img.width, img.height)
    return (int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1)


def largest_component(alpha: np.ndarray) -> np.ndarray:
    solid = binary_closing(alpha > 90, structure=np.ones((5, 5)))
    labeled, count = label(solid)
    if count == 0:
        raise RuntimeError("background removal produced an empty mask")
    areas = [(int((labeled == i).sum()), i) for i in range(1, count + 1)]
    areas.sort(reverse=True)
    keep = labeled == areas[0][1]
    out = np.zeros_like(alpha)
    out[keep] = alpha[keep]
    return out


def measure(mask: np.ndarray) -> dict:
    """Principal axis, width profile, and a proposed blade/handle split.

    The knife is treated as a long thin object: its principal axis is the line
    along the blade and handle, and the width profile is how thick it is at
    each point along that axis. A knife narrows sharply at the guard or
    ricasso, so the strongest sustained drop in width, on the handle side of
    centre, is where the two parts meet.
    """
    ys, xs = np.nonzero(mask > 90)
    if xs.size < 500:
        return {"ok": False, "reason": "mask too small"}

    pts = np.stack([xs, ys]).astype(np.float64)
    centre = pts.mean(axis=1, keepdims=True)
    centred = pts - centre
    cov = centred @ centred.T / centred.shape[1]
    evals, evecs = np.linalg.eigh(cov)
    u = evecs[:, int(np.argmax(evals))]          # along the knife
    v = np.array([-u[1], u[0]])                  # across it

    t = centred.T @ u
    s = centred.T @ v
    t0, t1 = float(t.min()), float(t.max())
    length = t1 - t0
    if length < 40:
        return {"ok": False, "reason": "subject not elongated"}

    BINS = 96
    edges = np.linspace(t0, t1, BINS + 1)
    idx = np.clip(np.digitize(t, edges) - 1, 0, BINS - 1)
    width = np.zeros(BINS)
    for b in range(BINS):
        sel = s[idx == b]
        width[b] = (sel.max() - sel.min()) if sel.size > 4 else 0.0

    # Which end is the handle: the thicker quarter. A blade tapers to a point,
    # a handle does not.
    head = width[: BINS // 4].mean()
    tail = width[-BINS // 4 :].mean()
    handle_at_start = head > tail
    # Orient u so it always runs handle -> tip.
    if not handle_at_start:
        pass
    else:
        u, v, t, s = -u, -v, -t, -s
        width = width[::-1]
        t0, t1 = -t1, -t0

    # Search the middle for the sharpest sustained narrowing.
    lo, hi = int(BINS * 0.22), int(BINS * 0.72)
    smooth = np.convolve(width, np.ones(5) / 5, mode="same")
    drop = smooth[lo:hi] - np.roll(smooth, -4)[lo:hi]
    b = int(np.argmax(drop)) + lo
    strength = float(drop.max() / max(smooth.max(), 1e-6))

    t_split = float(edges[0] + (b + 0.5) * (length / BINS)) if False else float(
        t0 + (b + 0.5) * (t1 - t0) / BINS
    )

    cx, cy = float(centre[0, 0]), float(centre[1, 0])
    px, py = cx + t_split * u[0], cy + t_split * u[1]
    h, w = mask.shape
    return {
        "ok": True,
        "axis": [float(u[0]), float(u[1])],
        "cross": [float(v[0]), float(v[1])],
        "point": [px / w, py / h],
        "handleFraction": float((t_split - t0) / (t1 - t0)),
        "confidence": round(strength, 3),
        "widthProfile": [round(float(x), 1) for x in width],
    }


def draw_review(rgba: Image.Image, geom: dict, slug: str) -> None:
    im = rgba.copy().convert("RGBA")
    chk = Image.new("RGBA", im.size, (30, 30, 34, 255))
    im = Image.alpha_composite(chk, im)
    d = ImageDraw.Draw(im)
    if geom.get("ok"):
        w, h = im.size
        px, py = geom["point"][0] * w, geom["point"][1] * h
        vx, vy = geom["cross"]
        L = max(w, h)
        d.line([(px - vx * L, py - vy * L), (px + vx * L, py + vy * L)],
               fill=(255, 92, 92, 255), width=5)
        ux, uy = geom["axis"]
        d.line([(px, py), (px + ux * 90, py + uy * 90)], fill=(92, 200, 255, 255), width=5)
        d.text((10, 10), f"{slug}  conf={geom['confidence']}", fill=(255, 255, 255, 255))
    else:
        d.text((10, 10), f"{slug}  FAILED: {geom.get('reason')}", fill=(255, 120, 120, 255))
    REVIEW.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(REVIEW / f"{slug}.png")


def main(slugs: list[str]) -> None:
    session = new_session("u2net")
    report: dict[str, dict] = {}
    if REPORT.exists():
        report = json.loads(REPORT.read_text())

    for slug in slugs:
        src = PRODUCTS / slug / "main.jpg"
        if not src.exists():
            print(f"  {slug}: no main.jpg, skipped")
            continue
        img = Image.open(src).convert("RGB").crop(content_box(Image.open(src)))
        cut = remove(img, session=session)
        arr = np.array(cut)
        arr[:, :, 3] = largest_component(arr[:, :, 3])

        ys, xs = np.nonzero(arr[:, :, 3] > 90)
        box = (max(int(xs.min()) - PAD, 0), max(int(ys.min()) - PAD, 0),
               min(int(xs.max()) + PAD + 1, arr.shape[1]),
               min(int(ys.max()) + PAD + 1, arr.shape[0]))
        rgba = Image.fromarray(arr).crop(box)

        geom = measure(np.array(rgba)[:, :, 3])
        (PRODUCTS / slug).mkdir(parents=True, exist_ok=True)
        rgba.save(PRODUCTS / slug / "cutout.png")
        draw_review(rgba, geom, slug)

        report[slug] = {"width": rgba.width, "height": rgba.height, **geom}
        report[slug].pop("widthProfile", None)
        print(f"  {slug}: {rgba.width}x{rgba.height} "
              f"{'conf=' + str(geom.get('confidence')) if geom.get('ok') else geom.get('reason')}")

    REPORT.write_text(json.dumps(report, indent=2) + "\n")
    print(f"\nwrote {REPORT.relative_to(ROOT)}")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        args = sorted(p.name for p in PRODUCTS.iterdir()
                      if (p / "main.jpg").exists())
    main(args)
