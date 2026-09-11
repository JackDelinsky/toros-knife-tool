#!/usr/bin/env python3
"""Build each knife's hero environment out of its own photograph.

The makers shot every knife outdoors on a real weathered stump, in real light.
That surface — its radial grain, its cracks, its moss, its depth of field — is
better environment material than anything that can be drawn, so this builds
the hero scene from it instead of inventing a landscape around it.

For each knife:

  1. the photograph is trimmed to its content box;
  2. the knife itself is masked out with u2net, and the mask is dilated;
  3. the largest knife-free horizontal band is found and mirrored outward to
     fill a full-width plate — the same stump, extended, never a new one;
  4. that becomes the `surface` layer the product rests on;
  5. the same photograph, heavily defocused, becomes the `far` and `mid`
     layers behind it, which is what the lens would have done anyway;
  6. a sky is graded to the photograph's own light and placed above;
  7. a near strip is defocused hard for the foreground.

Nothing invents product detail: the knife is removed from these plates, not
redrawn, and the cutout composited at runtime is the untouched photograph.
Nothing invents a place either — these are the surfaces the knives were really
photographed on, extended, not a claim about a location.

    python3 scripts/build-photo-scenes.py [slug ...]
"""

from __future__ import annotations

import os
import sys

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy.ndimage import binary_dilation, gaussian_filter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from hero_scene_lib import grain, over, radial, rgb, save_rgb, save_rgba, screen, tint, vertical  # noqa: E402
from nature_lib import bokeh, defocus, defocus_alpha, expose, haze_band, smoke, vary, water_bands  # noqa: E402


def grade(img: np.ndarray, temp: float, sat: float, stops: float,
          lift_amt: float, contrast: float) -> np.ndarray:
    """Push one layer toward a season and a time of day.

    The seven photographs were all taken on grey weathered wood in similar
    light, so without this they render seven versions of the same afternoon.
    Grading is the only honest way to separate them: it changes the light in
    the scene, never the product, which is composited afterwards untouched.
    """
    out = np.clip(img, 0, 1)
    # Temperature: positive is warmer, negative cooler.
    warm = np.array([1.0 + temp * 0.30, 1.0 + temp * 0.04, 1.0 - temp * 0.30], np.float32)
    out = np.clip(out * warm[None, None, :], 0, 1)
    grey = out.mean(axis=2, keepdims=True)
    out = np.clip(grey + (out - grey) * sat, 0, 1)
    return expose(out, stops=stops, lift=lift_amt, contrast=contrast)

SRC = os.path.join(HERE, "..", "public/images/products")
OUT = os.path.join(HERE, "..", "public/images/hero/scenes")

PLATE_W, PLATE_H = 1920, 1080
SKY = (900, 1600)
SURFACE_Y = 0.635          # where the top of the surface sits in the hero
LETTERBOX_LUMA = 18


def content_box(img: Image.Image):
    g = np.array(img.convert("L"), dtype=np.int16)
    rows = np.where(g.mean(axis=1) > LETTERBOX_LUMA)[0]
    cols = np.where(g.mean(axis=0) > LETTERBOX_LUMA)[0]
    if rows.size == 0 or cols.size == 0:
        return (0, 0, img.width, img.height)
    return (int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1)


def knife_mask(img: Image.Image, session) -> np.ndarray:
    """Where the product is, dilated so no sliver of it survives into a plate."""
    a = np.array(remove(img, session=session))[:, :, 3] > 90
    return binary_dilation(a, np.ones((25, 25)))


def clean_band(arr: np.ndarray, mask: np.ndarray, height: int):
    """The horizontal band of the photograph with the least product in it."""
    h = arr.shape[0]
    height = min(height, h)
    cover = mask.mean(axis=1)
    best, best_score = 0, 1e9
    for top in range(0, h - height + 1, 4):
        score = cover[top:top + height].mean()
        if score < best_score:
            best, best_score = top, score
    return arr[best:best + height], mask[best:best + height], best_score


def clean_rect(arr: np.ndarray, mask: np.ndarray):
    """The largest rectangle of the photograph containing no product at all.

    Two earlier attempts tried to remove the knife from a band instead:
    blurring its pixels left a ghost knife hanging in the background, and
    substituting neighbouring columns smeared a quarter of the frame into
    horizontal streaks. Neither is acceptable in a hero.

    A knife lies diagonally across these photographs, which leaves large
    untouched areas above and below it. Taking one of those whole is better
    than repairing the middle: every pixel is stump the camera really
    recorded, there is no seam, and nothing has to be invented.
    """
    h, w = mask.shape
    best = None
    for top in range(0, h - 40, 6):
        for height in range(40, h - top, 12):
            rows = mask[top:top + height]
            clean_cols = rows.mean(axis=0) < 0.005
            # widest run of fully clean columns
            run = start = 0
            bx = bw = 0
            for x in range(w):
                if clean_cols[x]:
                    if run == 0:
                        start = x
                    run += 1
                    if run > bw:
                        bw, bx = run, start
                else:
                    run = 0
            if bw < 60:
                continue
            area = bw * height
            # Favour wide over tall: the plate is 16:9 and stretching a narrow
            # patch across it is what makes an upscale look soft.
            score = area * min(bw / max(height, 1), 3.0)
            if best is None or score > best[0]:
                best = (score, top, height, bx, bw)
    if best is None:
        return arr, 1.0
    _, top, height, bx, bw = best
    return arr[top:top + height, bx:bx + bw], 0.0


def mirror_fill(band: np.ndarray, mask: np.ndarray, width: int) -> np.ndarray:
    """Widen a band to `width` by mirroring it, skipping the product's columns.

    Columns where the knife stood are dropped rather than smeared, so what
    fills the plate is only stump the camera actually recorded.
    """
    keep = mask.mean(axis=0) < 0.12
    if keep.sum() < band.shape[1] * 0.15:
        keep = mask.mean(axis=0) < mask.mean(axis=0).mean()
    src = band[:, keep, :]
    if src.shape[1] < 8:
        src = band
    tiles = []
    flip = False
    while sum(t.shape[1] for t in tiles) < width:
        tiles.append(src[:, ::-1, :] if flip else src)
        flip = not flip
    wide = np.concatenate(tiles, axis=1)[:, :width, :]
    # Soften the seams where mirrored copies meet.
    step = src.shape[1]
    out = wide.astype(np.float32)
    for x in range(step, width, step):
        lo, hi = max(x - 24, 0), min(x + 24, width)
        blend = gaussian_filter(out[:, lo:hi, :], (0, 9, 0))
        w = np.abs(np.linspace(-1, 1, hi - lo))[None, :, None]
        out[:, lo:hi, :] = out[:, lo:hi, :] * w + blend * (1 - w)
    return np.clip(out, 0, 255)


def lit_from(arr: np.ndarray) -> tuple[float, float]:
    """Which side of the photograph the light came from, so the scene agrees."""
    g = arr.mean(axis=2)
    h, w = g.shape
    left, right = g[:, : w // 3].mean(), g[:, -w // 3:].mean()
    top, bottom = g[: h // 3, :].mean(), g[-h // 3:, :].mean()
    return (0.5 + 0.32 * np.tanh((right - left) / 22.0),
            0.5 - 0.30 * np.tanh((top - bottom) / 22.0))


def palette(arr: np.ndarray) -> np.ndarray:
    """The photograph's own average colour, used to grade the sky to match."""
    return np.clip(arr.reshape(-1, 3).mean(axis=0) / 255.0, 0, 1)


def build(slug: str, session, g: dict) -> dict:
    sky_top, sky_low = g["top"], g["low"]
    lift, warmth, cloud = g["lift"], g["warmth"], g["cloud"]
    path = f"{SRC}/{slug}/main.jpg"
    img = Image.open(path).convert("RGB")
    img = img.crop(content_box(img))
    arr = np.asarray(img).astype(np.float32)
    mask = knife_mask(img, session)
    lx, ly = lit_from(arr)
    pal = palette(arr)

    # ---- surface: the stump, extended to full width -----------------------
    band, cover = clean_rect(arr, mask)
    # Stretched to width rather than tiled: a single upscale of a real
    # photograph stays convincingly wood, while a tiled one announces its
    # period no matter how the seams are blended.
    wide = band
    surf_h = int(PLATE_H * (1 - SURFACE_Y)) + 8
    surface = np.asarray(
        Image.fromarray(wide.astype(np.uint8)).resize((PLATE_W, surf_h), Image.LANCZOS)
    ).astype(np.float32) / 255.0

    plate = np.zeros((PLATE_H, PLATE_W, 3), np.float32)
    top = PLATE_H - surf_h
    plate[top:, :, :] = surface
    # The far edge of a log is not a ruled line. Give it a shallow irregular
    # profile and a soft shoulder, so the surface reads as a rounded object
    # the knife is resting on rather than a horizon drawn across the frame.
    from hero_scene_lib import below, profile
    edge_line = profile(PLATE_W,
                        [(0, SURFACE_Y + 0.012), (0.22, SURFACE_Y - 0.004),
                         (0.5, SURFACE_Y + 0.006), (0.78, SURFACE_Y - 0.008),
                         (1, SURFACE_Y + 0.010)],
                        roughness=0.006, detail=0.09, seed=abs(hash(slug)) % 500)
    alpha = below((PLATE_H, PLATE_W), edge_line, feather=3.0)
    alpha = gaussian_filter(alpha, 2.2)
    plate = plate * alpha[..., None]
    # Nearer to camera at the bottom of the frame, so the very front softens.
    near = np.clip((np.linspace(0, 1, PLATE_H) - 0.86) / 0.14, 0, 1)[:, None, None]
    plate = plate * (1 - near) + defocus(plate, 7.0) * near
    plate = grade(plate, g["temp"], g["sat"], lift, 0.03, 1.06)
    # The light that lit the photograph, continued across the extension.
    plate = screen(plate, tint(radial((PLATE_H, PLATE_W), lx, 0.42, 0.9, 0.5, 2.0)
                               * warmth * alpha, "#ffd9a0"))
    # A bright graze along the top edge where the light catches it, and a
    # short darkening just under it so the surface has thickness.
    edge = np.clip(alpha - gaussian_filter(alpha, 7), 0, 1)
    plate = screen(plate, tint(edge * 0.62, "#ffe6bd"))
    shelf = np.clip(gaussian_filter(alpha, 26) - alpha, 0, 1)
    plate = plate * (1 - shelf * 0.0)[..., None]
    under = np.clip(alpha - gaussian_filter(alpha, 34), 0, 1)
    plate = plate * (1 - under * 0.22)[..., None]
    save_rgba(np.clip(plate, 0, 1), alpha, f"{OUT}/{slug}-surface.webp", quality=82)

    # ---- far and mid: the same photograph, as the lens would blur it -------
    # Built from the product-free band, scaled up and thrown far out of focus.
    # The full frame must never be used here: blurring the knife leaves a
    # recognisable ghost of it hanging behind the real one.
    filled = np.asarray(
        Image.fromarray(band.astype(np.uint8)).resize((PLATE_W, PLATE_H), Image.LANCZOS)
    ).astype(np.float32) / 255.0

    mid = defocus(filled, 16.0)
    mid = grade(mid, g["temp"] * 1.15, g["sat"] * 1.05, lift * 0.6 + 0.04, 0.03, 1.02)
    mid_a = np.clip(vertical((PLATE_H, PLATE_W), 0.0, 1.0) * 1.6, 0, 1)
    mid_a = np.clip(mid_a * np.clip((np.linspace(0, 1, PLATE_H)[:, None] - 0.18) / 0.3, 0, 1), 0, 1)
    # One accent per scene, the thing that makes it its own place.
    acc = g.get("accent")
    if acc == "foliage":
        leaf = bokeh((PLATE_H, PLATE_W), 90, cy=0.30, spread=0.14, size=0.032, seed=11)
        mid = screen(mid, tint(leaf * 0.30, "#9fd27a"))
        mid_a = np.maximum(mid_a, leaf * 0.35)
    elif acc == "fog":
        mist = haze_band((PLATE_H, PLATE_W), 0.42, 0.030, seed=13)
        mid = screen(mid, tint(mist * 0.55, "#dde7ee"))
        mid_a = np.maximum(mid_a, mist * 0.55)
    elif acc == "embers":
        col_s = smoke((PLATE_H, PLATE_W), 0.74, 0.66, 0.55, 0.05, seed=17)
        mid = screen(mid, tint(col_s * 0.34, "#8e9aa8"))
        mid_a = np.maximum(mid_a, col_s * 0.34)
        mid = screen(mid, tint(radial((PLATE_H, PLATE_W), 0.78, 0.64, 0.30, 0.22, 2.0) * 0.55, "#ff9a44"))
    elif acc == "water":
        w = water_bands((PLATE_H, PLATE_W), 0.30, seed=19, count=16.0)
        mid = screen(mid, tint(w * 0.30, "#cfe6e2"))
        mid_a = np.maximum(mid_a, w * 0.30)
    elif acc == "dapple":
        from nature_lib import dapple
        d = dapple((PLATE_H, PLATE_W), 70, 0.44, 23, 22)
        mid = screen(mid, tint(d * 0.26, "#ffe3a8"))
    elif acc == "highland":
        mist = haze_band((PLATE_H, PLATE_W), 0.34, 0.050, seed=29)
        mid = screen(mid, tint(mist * 0.40, "#eef3f6"))
        mid_a = np.maximum(mid_a, mist * 0.40)
    save_rgba(mid, mid_a, f"{OUT}/{slug}-mid.webp", quality=74)

    far = defocus(filled, 34.0)
    far = grade(far, g["temp"] * 1.3, g["sat"] * 0.95, lift * 0.6 + 0.12, 0.05, 0.96)
    far_a = np.clip(np.clip((np.linspace(0, 1, PLATE_H)[:, None] - 0.16) / 0.36, 0, 1)
                    * np.ones((1, PLATE_W)), 0, 1) * 0.88
    save_rgba(far, far_a, f"{OUT}/{slug}-far.webp", quality=72)

    # ---- sky: graded to the photograph's own light ------------------------
    # Graded toward the photograph rather than a literal sky: at this scale
    # the frame is filled by an out-of-focus wood and leaf background, and a
    # blue sky behind a macro stump reads as a cut-out.
    s = (rgb(sky_top)[None, None, :] * vertical(SKY, 1.0, 0.0)[..., None]
         + rgb(sky_low)[None, None, :] * vertical(SKY, 0.0, 1.0)[..., None])
    s = np.clip(s * 0.45 + pal[None, None, :] * 0.85, 0, 1)
    if cloud > 0:
        from hero_scene_lib import fbm
        n = fbm(SKY, octaves=5, base=80, seed=hash(slug) % 999)
        mass = gaussian_filter(np.clip((n - (1 - cloud)) * 3.0, 0, 1), 11)
        s = over(s, "#fdf3e2", mass * 0.7 * vertical(SKY, 1.0, 0.3))
    s = screen(s, tint(radial(SKY, lx, 0.24, 0.8, 0.7, 2.2) * 0.55, "#ffeccb"))
    s = screen(s, tint(radial(SKY, lx, 0.24, 0.10, 0.10, 1.2) * 0.8, "#fff6e2"))
    # Pull the sky toward the photograph's colour so the two never disagree.
    s = np.clip(s * 0.72 + pal[None, None, :] * 0.34 + 0.06, 0, 1)
    s = grade(s, g["temp"] * 0.8, g["sat"] * 0.9, lift * 0.5, 0.02, 1.0)
    s = np.clip(s + grain(SKY, 0.6, 3)[..., None] * 0.012, 0, 1)
    save_rgb(s, f"{OUT}/{slug}-sky.webp", quality=82)

    # ---- fore: a hard-defocused near strip --------------------------------
    fh = 620
    strip = np.asarray(Image.fromarray(band[-max(band.shape[0] // 3, 8):].astype(np.uint8))
                       .resize((PLATE_W, fh), Image.LANCZOS)).astype(np.float32) / 255.0
    fore = grade(defocus(strip, 26.0), g["temp"], g["sat"], lift * 0.4, 0.02, 1.0)
    fa = np.clip((np.linspace(0, 1, fh)[:, None] - 0.10) / 0.5, 0, 1) * np.ones((1, PLATE_W))
    fa = fa * 0.80
    save_rgba(fore, fa, f"{OUT}/{slug}-fore.webp", quality=74)

    print(f"    band knife-cover {cover:.3f}")
    return {"light": [round(float(lx), 3), round(float(ly), 3)],
            "palette": [round(float(c), 3) for c in pal]}


# Per-scene grade: sky colours, exposure lift, warm-light strength, cloud.
# Chosen so the seven read as different times of day while every one of them
# still agrees with the light in its own photograph.
# sky_top, sky_low, exposure lift, warm-light strength, cloud, temperature,
# saturation, accent. Temperature and saturation are what actually separate
# the seven: the source photographs share one grey afternoon.
GRADE = {
    "toros-jellybean":             dict(top="#8fc0d6", low="#dff0c8", lift=0.30, warmth=0.16,
                                        cloud=0.45, temp=-0.10, sat=1.55, accent="foliage"),
    "bos-stag-golden-horn":        dict(top="#7ba6cc", low="#f8dc9e", lift=0.26, warmth=0.40,
                                        cloud=0.28, temp=0.34, sat=1.35, accent="dapple"),
    "sakra-bear-claw-neck-knives": dict(top="#a8bccc", low="#e2ebf1", lift=0.30, warmth=0.06,
                                        cloud=0.70, temp=-0.26, sat=0.72, accent="fog"),
    "misty-stubby-giraffe":        dict(top="#8ab2c6", low="#f0dfb2", lift=0.28, warmth=0.30,
                                        cloud=0.22, temp=0.22, sat=1.45, accent="dapple"),
    "misty-rebar-shank":           dict(top="#2f4562", low="#6b6a70", lift=-0.16, warmth=0.26,
                                        cloud=0.40, temp=-0.20, sat=0.95, accent="embers"),
    "gur-tuva":                    dict(top="#a6c6da", low="#eef0e8", lift=0.36, warmth=0.10,
                                        cloud=0.34, temp=-0.12, sat=0.88, accent="highland"),
    "gur-tombik":                  dict(top="#6f97a6", low="#cfdcc4", lift=0.20, warmth=0.18,
                                        cloud=0.44, temp=-0.04, sat=1.40, accent="water"),
}


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    session = new_session("u2net")
    names = sys.argv[1:] or list(GRADE)
    report = {}
    for slug in names:
        if slug not in GRADE:
            print(f"  unknown scene {slug}")
            continue
        report[slug] = build(slug, session, GRADE[slug])
        print(f"  {slug}: light={report[slug]['light']}")
    import json
    with open(os.path.join(HERE, "_nature_scene_report.json"), "w") as f:
        json.dump(report, f, indent=2)


if __name__ == "__main__":
    main()
