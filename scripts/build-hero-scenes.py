#!/usr/bin/env python3
"""Render the seven hero environment scenes as layered plates.

Each knife gets three raster layers plus the CSS lighting pass applied at
runtime:

  {slug}-plate.webp   far background — sky, wall, air, the scene's light
  {slug}-mid.webp     middle ground  — terrain, bench, anvil (RGBA)
  {slug}-fore.webp    foreground     — the near element that overlaps the
                                       product's base (RGBA)

Nothing here draws a knife. The real photographed cutout is composited
between `mid` and `fore` at runtime, so the product is never generated,
retouched or reinterpreted.

    python3 scripts/build-hero-scenes.py
"""

from __future__ import annotations

import json
import os
import sys

import numpy as np
from scipy.ndimage import gaussian_filter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hero_scene_lib import (  # noqa: E402
    bar, below, blob, fbm, grain, coords, over, profile, radial, rect,
    rgb, rim, save_rgb, save_rgba, screen, streaks, tint, vertical,
)

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "..", "public", "images", "hero", "scenes")

PLATE = (1080, 1920)
MID = (1080, 1920)
FORE = (460, 1600)


# --------------------------------------------------------------------------
# shared finishing
# --------------------------------------------------------------------------

def dust(shape, count, seed, size=1.6, bright=0.5):
    """Suspended particles at mixed depths — a few large and near, many small
    and far. Baked in rather than animated, so nothing loops on the GPU."""
    h, w = shape
    rng = np.random.default_rng(seed)
    field = np.zeros(shape, dtype=np.float32)
    for depth in range(3):
        n = count // (depth + 1)
        ys = rng.integers(0, h, n)
        xs = rng.integers(0, w, n)
        field[ys, xs] += bright / (depth + 1)
        field = gaussian_filter(field, sigma=size * (depth + 1) * 0.6)
    return np.clip(field * 6.0, 0.0, 1.0)


def finish(img, seed, vignette=0.55, grain_amount=0.022):
    """Grain plus a soft vignette. Both are what make a rendered plate read as
    photographed air instead of a gradient."""
    x, y = coords(img.shape[:2])
    d = np.sqrt((x - 0.5) ** 2 + ((y - 0.5) * 0.85) ** 2)
    vig = np.clip(1.0 - vignette * np.clip((d - 0.28) / 0.55, 0, 1) ** 1.5, 0, 1)
    img = img * vig[..., np.newaxis]
    img = img + grain(img.shape[:2], sigma=0.55, seed=seed)[..., np.newaxis] * grain_amount
    return np.clip(img, 0.0, 1.0)


def depth_haze(mask, strength):
    """Push a silhouette back in space by lifting its blacks toward the air
    colour — aerial perspective, the cheapest honest depth cue there is."""
    return np.clip(mask * strength, 0.0, 1.0)


# --------------------------------------------------------------------------
# 1. Toros Jellybean — charred walnut / forest-floor micro-landscape
# --------------------------------------------------------------------------

def jellybean():
    base = np.zeros((*PLATE, 3), dtype=np.float32)
    base += rgb("#080d0b")[None, None, :] * vertical(PLATE, 1.0, 0.35)[..., None]

    # Canopy gap: a cool shaft entering high and left, broken by leaves.
    shaft = radial(PLATE, 0.24, 0.02, 0.60, 0.95, falloff=2.2) * 0.60
    shaft *= 0.45 + 0.55 * fbm(PLATE, octaves=4, base=150, seed=11)
    base = screen(base, tint(shaft, "#527f6c"))

    # Narrow warm edge from the opposite side keeps it from going flat green.
    base = screen(base, tint(radial(PLATE, 1.02, 0.40, 0.34, 0.60, 2.6) * 0.34, "#8a5f30"))
    base = screen(base, tint(fbm(PLATE, octaves=4, base=260, seed=12) * 0.08, "#3d6053"))
    save_rgb(finish(base, 101, vignette=0.58), f"{OUT}/toros-jellybean-plate.webp")

    # --- middle ground: fallen charred log on a mossy floor ---
    a = np.zeros(MID, dtype=np.float32)
    col = np.zeros((*MID, 3), dtype=np.float32)

    far = below(MID, profile(MID[1], [(0, .70), (.14, .655), (.3, .68), (.46, .645),
                                      (.62, .70), (.8, .66), (1, .69)], .020, .07, 21))
    far = gaussian_filter(far, 3.0)
    a = np.maximum(a, far * 0.80)
    col = over(col, "#121b17", far * 0.80)

    # The log: a long low mass, charred along its length. Char is directional
    # streaking, not a repeating wave.
    log = blob(MID, 0.44, 0.87, 0.70, 0.145, roughness=0.13, seed=22)
    log = np.maximum(log, blob(MID, 0.88, 0.81, 0.24, 0.075, roughness=0.16, seed=23))
    char = streaks(MID, length=0.055, fineness=0.0035, seed=24)
    col = over(col, "#0a0806", log)
    col += tint(log * char * 0.11, "#4e3826")
    a = np.maximum(a, log)

    # Moss holds to the top and the damp side of the log.
    moss_field = fbm(MID, octaves=5, base=30, seed=26)
    moss = blob(MID, 0.22, 0.885, 0.32, 0.095, roughness=0.34, seed=25)
    moss = np.maximum(moss, blob(MID, 0.70, 0.925, 0.26, 0.065, roughness=0.38, seed=27))
    moss = np.maximum(moss, log * np.clip((moss_field - 0.52) * 6, 0, 1) * 0.8)
    moss = np.clip(moss * np.clip((moss_field - 0.34) * 3.2, 0, 1), 0, 1)
    a = np.maximum(a, moss)
    col += tint(moss * 0.62, "#33513a")

    col += tint(rim(log, 0.35, -0.94, 13.0) * 0.85, "#8fae98")
    a = np.clip(gaussian_filter(a, 1.1), 0, 1)
    save_rgba(np.clip(col, 0, 1), a, f"{OUT}/toros-jellybean-mid.webp")

    # --- foreground: out-of-focus leaf litter ---
    fa = np.zeros(FORE, dtype=np.float32)
    for i, (cx, cy, rx, ry) in enumerate([
        (0.04, 0.98, 0.26, 0.60), (0.28, 1.10, 0.22, 0.48),
        (0.70, 1.06, 0.28, 0.52), (0.97, 0.96, 0.24, 0.62),
    ]):
        fa = np.maximum(fa, blob(FORE, cx, cy, rx, ry, roughness=0.34, seed=40 + i))
    fa = gaussian_filter(fa, 15)
    fc = over(np.zeros((*FORE, 3), np.float32), "#060906", fa)
    fc += tint(fa * fbm(FORE, base=30, seed=44) * 0.20, "#2f4c39")
    fc += tint(rim(fa, 0.30, -0.95, 22.0) * 0.5, "#6f8c7a")
    save_rgba(fc, np.clip(fa, 0, 1), f"{OUT}/toros-jellybean-fore.webp")


# --------------------------------------------------------------------------
# 2. BOS Stag Golden Horn — Taurus ridgelines at first light
# --------------------------------------------------------------------------

def stag():
    base = np.zeros((*PLATE, 3), dtype=np.float32)
    base += rgb("#0c0b09")[None, None, :] * vertical(PLATE, 0.85, 1.0)[..., None]

    base = screen(base, tint(radial(PLATE, 0.72, 0.62, 0.62, 0.42, 2.2) * 0.72, "#b8752b"))
    base = screen(base, tint(radial(PLATE, 0.72, 0.60, 0.26, 0.16, 1.4) * 0.55, "#e0a95a"))
    base = screen(base, tint(radial(PLATE, 0.30, 0.10, 0.70, 0.60, 3.0) * 0.10, "#3d4a58"))

    # Stratified haze at the horizon — the giveaway of real distance.
    _, y = coords(PLATE)
    bands = np.exp(-((y - 0.60) ** 2) / 0.006) * (0.45 + 0.55 * fbm(PLATE, base=300, seed=31))
    base = screen(base, tint(bands * 0.34, "#c69355"))
    save_rgb(finish(base, 102, vignette=0.5), f"{OUT}/bos-stag-golden-horn-plate.webp")

    a = np.zeros(MID, dtype=np.float32)
    col = np.zeros((*MID, 3), dtype=np.float32)

    # Three ridges: further ones sit higher, lighter and softer.
    ridges = [
        ([(0, .62), (.12, .575), (.24, .60), (.36, .555), (.52, .615), (.68, .535),
          (.84, .60), (1, .58)], .026, .09, "#2c2e34", .58, 3.2),
        ([(0, .70), (.14, .655), (.3, .69), (.46, .625), (.62, .70), (.8, .635),
          (1, .68)], .030, .075, "#191a1e", .82, 1.8),
        ([(0, .80), (.16, .755), (.34, .81), (.5, .745), (.68, .815), (.86, .74),
          (1, .79)], .036, .06, "#0a0a0b", 1.00, 1.0),
    ]
    for i, (pts, rough, det, colour, alpha, blur) in enumerate(ridges):
        m = gaussian_filter(below(MID, profile(MID[1], pts, rough, det, 50 + i)), blur)
        col = over(col, colour, m * alpha)
        a = np.maximum(a, m * alpha)
        # First light grazes each crest from behind and to the right.
        col += tint(rim(m, 0.25, -0.97, 11.0 + 4 * i) * (1.05 - 0.22 * i), "#e8b268")

    motes = dust(MID, 900, 55)
    col += tint(motes * 0.42, "#d8b073")
    a = np.maximum(a, motes * 0.32)
    save_rgba(np.clip(col, 0, 1), np.clip(a, 0, 1), f"{OUT}/bos-stag-golden-horn-mid.webp")

    fa = blob(FORE, 0.08, 1.04, 0.42, 0.66, roughness=0.24, seed=60)
    fa = np.maximum(fa, blob(FORE, 0.90, 1.12, 0.36, 0.58, roughness=0.28, seed=61))
    fa = gaussian_filter(fa, 9)
    fc = over(np.zeros((*FORE, 3), np.float32), "#080706", fa)
    fc += tint(rim(fa, 0.55, -0.84, 20.0) * 0.60, "#a87b3e")
    save_rgba(fc, np.clip(fa, 0, 1), f"{OUT}/bos-stag-golden-horn-fore.webp")


# --------------------------------------------------------------------------
# 3. Sakra Bear Claw — cold crag under a moon
# --------------------------------------------------------------------------

def bearclaw():
    base = np.zeros((*PLATE, 3), dtype=np.float32)
    base += rgb("#080b0f")[None, None, :] * vertical(PLATE, 1.0, 0.55)[..., None]
    base = screen(base, tint(radial(PLATE, 0.80, 0.16, 0.60, 0.62, 2.6) * 0.42, "#5d7692"))
    base = screen(base, tint(radial(PLATE, 0.80, 0.15, 0.09, 0.09, 1.1) * 0.60, "#c3d4e4"))
    base = screen(base, tint(fbm(PLATE, octaves=5, base=240, seed=33) * 0.10, "#3a4d63"))
    save_rgb(finish(base, 103, vignette=0.6), f"{OUT}/sakra-bear-claw-neck-knives-plate.webp")

    a = np.zeros(MID, dtype=np.float32)
    col = np.zeros((*MID, 3), dtype=np.float32)

    # Weathered crag, not spikes: steep on one face, broken and stepped on the
    # other. The claw stays an abstract echo in the rock's rake — never drawn.
    # Weathered rock is fractal at every scale. Sparse control points plus a
    # small displacement gives clean triangles, which is exactly what a crag
    # does not look like — so the points only set the broad rake and the
    # displacement does the shaping.
    crags = [
        ([(0, .58), (.10, .50), (.20, .56), (.32, .62), (.46, .74), (.60, .84),
          (.75, .93), (1, 1.02)], .075, .020, "#1c222a", .68, 2.4),
        ([(0, 1.05), (.42, .96), (.56, .80), (.66, .70), (.76, .66), (.88, .68),
          (1, .74)], .070, .017, "#12171d", .86, 1.6),
        ([(0, 1.00), (.25, .93), (.5, .97), (.75, .91), (1, .95)],
         .050, .030, "#07090b", 1.0, 1.1),
    ]
    for i, (pts, rough, det, colour, alpha, blur) in enumerate(crags):
        m = gaussian_filter(below(MID, profile(MID[1], pts, rough, det, 70 + i)), blur)
        col = over(col, colour, m * alpha)
        a = np.maximum(a, m * alpha)
        # Moonlight arrives from the upper right.
        col += tint(rim(m, -0.55, -0.84, 10.0 + 4 * i) * (0.95 - 0.20 * i), "#b3c8dd")
        # Cold fracture texture on the rock faces.
        col += tint(m * streaks(MID, length=0.02, fineness=0.02, seed=76 + i) * 0.05, "#7f96ad")

    save_rgba(np.clip(col, 0, 1), np.clip(a, 0, 1),
              f"{OUT}/sakra-bear-claw-neck-knives-mid.webp")

    # Foreground: a stone lip, and the cord these knives actually hang from
    # entering the frame — a material that belongs to the product.
    fa = blob(FORE, 0.84, 1.06, 0.44, 0.64, roughness=0.26, seed=80)
    fa = np.maximum(fa, blob(FORE, 0.02, 1.14, 0.30, 0.54, roughness=0.30, seed=81))
    fa = gaussian_filter(fa, 10)
    cord = bar(FORE, -0.05, 0.58, 0.30, 1.02, 0.013)
    cord = np.maximum(cord, bar(FORE, 0.30, 1.02, 0.58, 0.70, 0.013))
    cord = gaussian_filter(cord, 2.5)
    fc = over(np.zeros((*FORE, 3), np.float32), "#06080a", fa)
    fc = over(fc, "#31261b", cord)
    fc += tint(rim(fa, -0.6, -0.8, 22.0) * 0.55, "#9db4c9")
    fc += tint(rim(cord, -0.6, -0.8, 5.0) * 0.5, "#8a7154")
    save_rgba(fc, np.clip(np.maximum(fa, cord * 0.92), 0, 1),
              f"{OUT}/sakra-bear-claw-neck-knives-fore.webp")


# --------------------------------------------------------------------------
# 4. Misty Stubby Giraffe — the maker's bench
# --------------------------------------------------------------------------

def giraffe():
    base = np.zeros((*PLATE, 3), dtype=np.float32)
    base += rgb("#120c07")[None, None, :] * vertical(PLATE, 0.9, 1.0)[..., None]
    # One warm bench lamp, high and left, falling off across the back wall.
    base = screen(base, tint(radial(PLATE, 0.24, 0.10, 0.70, 0.76, 2.0) * 0.58, "#c08a45"))
    base = screen(base, tint(radial(PLATE, 0.95, 0.72, 0.36, 0.40, 2.6) * 0.15, "#4a6a7a"))
    # Vertical boarding on the wall behind the bench, irregular as real timber.
    boards = streaks(PLATE, length=0.0015, fineness=0.09, seed=34)
    base = screen(base, tint(boards * 0.07, "#6b4a2a"))
    save_rgb(finish(base, 104, vignette=0.5), f"{OUT}/misty-stubby-giraffe-plate.webp")

    a = np.zeros(MID, dtype=np.float32)
    col = np.zeros((*MID, 3), dtype=np.float32)

    # Blocks, a vice and tool handles standing at the back of the bench —
    # squared off, because a workshop is full of straight edges.
    shapes = [
        rect(MID, 0.06, 0.575, 0.135, 0.745, 3),
        rect(MID, 0.145, 0.635, 0.20, 0.745, 3),
        rect(MID, 0.795, 0.545, 0.845, 0.745, 3),
        rect(MID, 0.855, 0.640, 0.965, 0.745, 3),
        bar(MID, 0.885, 0.545, 0.905, 0.66, 0.010),
        bar(MID, 0.915, 0.560, 0.935, 0.66, 0.009),
    ]
    blocks = np.clip(sum(shapes), 0, 1)
    blocks = gaussian_filter(blocks, 6)          # sitting behind the focal plane
    col = over(col, "#17100a", blocks * 0.92)
    col += tint(rim(blocks, 0.85, -0.53, 16.0) * 0.55, "#c99154")
    a = np.maximum(a, blocks * 0.92)

    # The bench top, with grain running along it.
    top = gaussian_filter(below(MID, profile(MID[1], [(0, .745), (.5, .742), (1, .747)],
                                             .003, .18, 95)), 1.4)
    wood = streaks(MID, length=0.09, fineness=0.0025, seed=96)
    col = over(col, "#2b1b0e", top)
    col += tint(top * wood * 0.16, "#7f5629")
    col += tint(rim(top, 0.4, -0.92, 9.0) * 0.85, "#d9a75f")
    a = np.maximum(a, top)

    save_rgba(np.clip(col, 0, 1), np.clip(a, 0, 1), f"{OUT}/misty-stubby-giraffe-mid.webp")

    # Foreground: shavings curling off the front edge of the bench.
    fa = np.zeros(FORE, dtype=np.float32)
    for x0, y0, x1, y1, t in [
        (0.02, 0.80, 0.15, 0.66, 0.028), (0.15, 0.66, 0.28, 0.86, 0.026),
        (0.06, 0.94, 0.20, 0.82, 0.022),
        (0.73, 0.90, 0.85, 0.70, 0.026), (0.85, 0.70, 0.98, 0.88, 0.028),
    ]:
        fa = np.maximum(fa, bar(FORE, x0, y0, x1, y1, t))
    fa = np.maximum(fa, blob(FORE, 0.5, 1.34, 0.9, 0.52, roughness=0.08, seed=98))
    fa = gaussian_filter(fa, 7)
    fc = over(np.zeros((*FORE, 3), np.float32), "#0d0805", fa)
    fc += tint(rim(fa, 0.7, -0.71, 14.0) * 0.75, "#c99154")
    save_rgba(fc, np.clip(fa, 0, 1), f"{OUT}/misty-stubby-giraffe-fore.webp")


# --------------------------------------------------------------------------
# 5. Misty Rebar Shank — the forge floor
# --------------------------------------------------------------------------

def rebar():
    base = np.zeros((*PLATE, 3), dtype=np.float32)
    base += rgb("#080706")[None, None, :] * vertical(PLATE, 0.7, 1.0)[..., None]
    # Forge mouth: small, hot, low and right — the only real light in the room.
    base = screen(base, tint(radial(PLATE, 0.78, 0.64, 0.46, 0.36, 2.4) * 0.72, "#c04a12"))
    base = screen(base, tint(radial(PLATE, 0.78, 0.64, 0.10, 0.08, 1.2) * 0.90, "#ffb154"))
    base = screen(base, tint(radial(PLATE, 0.10, 0.18, 0.44, 0.52, 3.0) * 0.11, "#3d5566"))
    # Smoke rising through the light.
    smoke = fbm(PLATE, octaves=5, base=210, seed=35)
    smoke = smoke * np.clip(1.3 - coords(PLATE)[1], 0, 1) ** 1.5
    base = screen(base, tint(smoke * 0.18, "#7a5236"))
    save_rgb(finish(base, 105, vignette=0.64), f"{OUT}/misty-rebar-shank-plate.webp")

    a = np.zeros(MID, dtype=np.float32)
    col = np.zeros((*MID, 3), dtype=np.float32)

    # An anvil is a made object: flat face, tapered horn, waisted body, splayed
    # foot. Built from rectangles so it reads as forged iron, not a boulder.
    anvil = np.clip(
        rect(MID, 0.09, 0.640, 0.37, 0.700, 2)            # face and body
        + rect(MID, 0.14, 0.700, 0.33, 0.760, 2)          # under the face
        + rect(MID, 0.185, 0.760, 0.275, 0.885, 2)        # waist
        + rect(MID, 0.125, 0.885, 0.335, 0.955, 2)        # foot
        + bar(MID, 0.090, 0.665, 0.008, 0.680, 0.018)     # horn
        + rect(MID, 0.355, 0.648, 0.405, 0.692, 2),       # heel
        0, 1)
    col = over(col, "#08090a", anvil)
    # The forge is low and to the right, so that is the side that catches.
    col += tint(rim(anvil, 0.86, -0.28, 8.0) * 1.25, "#ff8a3a")
    a = np.maximum(a, anvil)

    floor = gaussian_filter(below(MID, profile(MID[1], [(0, .955), (.5, .95), (1, .957)],
                                               .008, .16, 114)), 2.0)
    col = over(col, "#0b0908", floor)
    col += tint(floor * radial(MID, 0.78, 0.94, 0.55, 0.30, 2.0) * 0.45, "#b8531a")
    col += tint(floor * streaks(MID, length=0.05, fineness=0.006, seed=116) * 0.06, "#8a4a20")
    a = np.maximum(a, floor)

    sparks = dust(MID, 220, 115, size=1.0, bright=0.9)
    sparks = sparks * radial(MID, 0.76, 0.68, 0.5, 0.45, 1.6)
    col += tint(sparks * 1.0, "#ffb154")
    a = np.maximum(a, sparks * 0.85)

    save_rgba(np.clip(col, 0, 1), np.clip(a, 0, 1), f"{OUT}/misty-rebar-shank-mid.webp")

    # Foreground: real rebar geometry — a deformed bar with its lugs.
    core = bar(FORE, -0.05, 0.74, 1.05, 0.97, 0.085)
    lugs = np.zeros(FORE, dtype=np.float32)
    for i in range(34):
        t = i / 33.0
        x = -0.05 + t * 1.10
        y = 0.74 + t * 0.23
        lugs = np.maximum(lugs, bar(FORE, x - 0.014, y - 0.090, x + 0.030, y + 0.090, 0.016))
    fa = np.clip(np.maximum(core, lugs * (core > 0.02)), 0, 1)
    fa = np.maximum(fa, bar(FORE, -0.05, 1.14, 1.05, 0.88, 0.070))
    fa = gaussian_filter(fa, 4)
    fc = over(np.zeros((*FORE, 3), np.float32), "#0a0908", fa)
    fc += tint(rim(fa, 0.25, -0.97, 11.0) * 0.95, "#e0621a")
    save_rgba(fc, fa, f"{OUT}/misty-rebar-shank-fore.webp")


# --------------------------------------------------------------------------
# 6. GUR Tuva — open windswept highland
# --------------------------------------------------------------------------

def tuva():
    base = np.zeros((*PLATE, 3), dtype=np.float32)
    # A quieter, higher-key sky than the rest — this scene's contrast comes
    # from the depth of the ground shadow, not from a coloured glow.
    base += rgb("#20262b")[None, None, :] * vertical(PLATE, 1.0, 0.10, gamma=0.75)[..., None]
    base = screen(base, tint(radial(PLATE, 0.42, 0.26, 0.85, 0.55, 1.8) * 0.30, "#8f9aa3"))
    # Cloud drawn out by wind, not banding: wide, soft and low-contrast.
    wind = streaks(PLATE, length=0.22, fineness=0.020, seed=36)
    wind = gaussian_filter(wind, (9, 3))
    _, y = coords(PLATE)
    base = screen(base, tint((wind - 0.42) * np.exp(-((y - 0.30) ** 2) / 0.05) * 0.30, "#b3bcc4"))
    save_rgb(finish(base, 106, vignette=0.42), f"{OUT}/gur-tuva-plate.webp")

    a = np.zeros(MID, dtype=np.float32)
    col = np.zeros((*MID, 3), dtype=np.float32)

    # Wide, low, flat land — the composition stays open on purpose.
    for i, (pts, colour, alpha, blur) in enumerate([
        ([(0, .66), (.2, .642), (.35, .635), (.55, .652), (.7, .638), (1, .63)],
         "#3d444b", .60, 3.4),
        ([(0, .73), (.22, .712), (.4, .703), (.6, .722), (.78, .705), (1, .70)],
         "#23272b", .85, 2.0),
        ([(0, .82), (.3, .803), (.5, .81), (.72, .80), (1, .815)], "#0d0f11", 1.0, 1.2),
    ]):
        m = gaussian_filter(below(MID, profile(MID[1], pts, .014, .22, 130 + i)), blur)
        col = over(col, colour, m * alpha)
        a = np.maximum(a, m * alpha)
        col += tint(rim(m, 0.30, -0.95, 12.0 + 5 * i) * (0.75 - 0.18 * i), "#d6dde3")

    save_rgba(np.clip(col, 0, 1), np.clip(a, 0, 1), f"{OUT}/gur-tuva-mid.webp")

    fa = gaussian_filter(blob(FORE, 0.96, 1.00, 0.32, 0.72, roughness=0.22, seed=140), 8)
    fc = over(np.zeros((*FORE, 3), np.float32), "#0a0c0d", fa)
    fc += tint(rim(fa, 0.75, -0.66, 20.0) * 0.55, "#a5aeb6")
    save_rgba(fc, np.clip(fa, 0, 1), f"{OUT}/gur-tuva-fore.webp")


# --------------------------------------------------------------------------
# 7. GUR Tombik — walnut and rounded stone in copper light
# --------------------------------------------------------------------------

def tombik():
    base = np.zeros((*PLATE, 3), dtype=np.float32)
    base += rgb("#0d0906")[None, None, :] * vertical(PLATE, 0.9, 1.0)[..., None]
    base = screen(base, tint(radial(PLATE, -0.04, 0.42, 0.66, 0.78, 2.0) * 0.70, "#b3641f"))
    base = screen(base, tint(radial(PLATE, 0.92, 0.88, 0.34, 0.26, 2.6) * 0.16, "#c04a12"))
    base = screen(base, tint(fbm(PLATE, octaves=4, base=230, seed=37) * 0.07, "#6b4326"))
    save_rgb(finish(base, 107, vignette=0.56), f"{OUT}/gur-tombik-plate.webp")

    a = np.zeros(MID, dtype=np.float32)
    col = np.zeros((*MID, 3), dtype=np.float32)

    # A walnut slab edge running behind, with grain along it.
    slab = gaussian_filter(below(MID, profile(MID[1], [(0, .700), (.5, .694), (1, .706)],
                                              .005, .22, 155)), 1.6)
    slab_bottom = gaussian_filter(below(MID, profile(MID[1], [(0, .790), (1, .795)],
                                                     .003, .3, 156)), 1.6)
    slab = np.clip(slab - slab_bottom, 0, 1)
    wood = streaks(MID, length=0.11, fineness=0.003, seed=157)
    col = over(col, "#23170d", slab)
    col += tint(slab * wood * 0.20, "#96632c")
    col += tint(rim(slab, 0.92, -0.39, 8.0) * 0.9, "#c98240")
    a = np.maximum(a, slab)

    # Rounded masses echo the knife's own heavy, rounded proportions.
    for i, (cx, cy, rx, ry, colour, alpha) in enumerate([
        (0.14, 0.90, 0.26, 0.22, "#1e150d", 0.85),
        (0.86, 0.92, 0.30, 0.20, "#181009", 0.90),
        (0.50, 1.00, 0.42, 0.18, "#0c0806", 1.00),
    ]):
        m = gaussian_filter(blob(MID, cx, cy, rx, ry, roughness=0.18, seed=150 + i), 4)
        col = over(col, colour, m * alpha)
        a = np.maximum(a, m * alpha)
        col += tint(rim(m, 0.94, -0.34, 14.0) * 1.05, "#d08840")

    save_rgba(np.clip(col, 0, 1), np.clip(a, 0, 1), f"{OUT}/gur-tombik-mid.webp")

    fa = gaussian_filter(blob(FORE, 0.06, 1.02, 0.38, 0.70, roughness=0.22, seed=160), 10)
    fa = np.maximum(fa, gaussian_filter(blob(FORE, 0.66, 1.20, 0.46, 0.54, 0.20, 161), 12))
    fc = over(np.zeros((*FORE, 3), np.float32), "#080604", fa)
    fc += tint(rim(fa, 0.90, -0.44, 22.0) * 0.70, "#bd7a33")
    save_rgba(fc, np.clip(fa, 0, 1), f"{OUT}/gur-tombik-fore.webp")


SCENES = {
    "toros-jellybean": jellybean,
    "bos-stag-golden-horn": stag,
    "sakra-bear-claw-neck-knives": bearclaw,
    "misty-stubby-giraffe": giraffe,
    "misty-rebar-shank": rebar,
    "gur-tuva": tuva,
    "gur-tombik": tombik,
}


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    wanted = set(sys.argv[1:]) or set(SCENES)
    report = {}
    for slug, fn in SCENES.items():
        if slug not in wanted:
            continue
        fn()
        report[slug] = {
            layer: os.path.getsize(f"{OUT}/{slug}-{layer}.webp")
            for layer in ("plate", "mid", "fore")
        }
        total = sum(report[slug].values())
        print(f"{slug:32s} {total / 1024:7.1f} KB  "
              + "  ".join(f"{k}={v / 1024:.0f}K" for k, v in report[slug].items()))
    print(f"{'TOTAL':32s} {sum(sum(v.values()) for v in report.values()) / 1024:7.1f} KB")
    with open(os.path.join(os.path.dirname(OUT), "..", "..", "..", "scripts",
                           "_hero_scene_report.json"), "w") as fh:
        json.dump(report, fh, indent=2)


if __name__ == "__main__":
    main()
