#!/usr/bin/env python3
"""Primitives for rendering believable outdoor plates.

Extends `hero_scene_lib` from abstract light-and-terrain shapes toward things
that read as woodland: bark, moss, stone, foliage, grass, water, conifers,
light shafts, dapple and out-of-focus highlights.

Nothing in this file draws a knife, a tool, a person, an animal, a building or
any lettering. It renders environments only; the real photographed cutout is
composited into them at runtime and is never touched.

Three things do most of the work in making a synthetic plate stop looking
synthetic, and every primitive here is built around them:

  depth of field   only the product's own plane is sharp. Distance and
                   nearness both blur, and near blur is much stronger.
  aerial haze      further away is lighter, bluer and lower in contrast.
  varied colour    a real leaf mass is a hundred greens. Flat tints look
                   printed, so hue and value are driven by noise everywhere.
"""

from __future__ import annotations

import os
import sys

import numpy as np
from scipy.ndimage import gaussian_filter, maximum_filter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hero_scene_lib import coords, fbm, rgb  # noqa: E402


# ---------------------------------------------------------------------------
# Colour
# ---------------------------------------------------------------------------

def vary(colour: str, shape: tuple[int, int], amount: float = 0.16,
         scale: float = 40.0, seed: int = 0) -> np.ndarray:
    """A colour field that drifts around `colour` instead of being flat.

    Real foliage, bark and stone are never one value. This multiplies the base
    colour by low-frequency noise and pushes hue slightly as it goes, which is
    what stops a filled shape reading as a paint chip.
    """
    base = rgb(colour)
    n = fbm(shape, octaves=4, base=scale, seed=seed)
    n = (n - n.mean()) / (n.std() + 1e-6)
    field = np.clip(1.0 + n * amount, 0.35, 1.9)[..., None] * base[None, None, :]
    # A second, offset field nudges hue so highlights are not just brighter.
    h = fbm(shape, octaves=3, base=scale * 1.7, seed=seed + 991)
    h = (h - h.mean())[..., None] * amount * 0.5
    field = field * (1.0 + h * np.array([1.0, 0.2, -0.9])[None, None, :])
    return np.clip(field, 0.0, 1.0).astype(np.float32)


def aerial(colour_field: np.ndarray, amount: float, sky: str = "#b9cddd") -> np.ndarray:
    """Push a layer toward the sky colour: the further away, the more of it."""
    return np.clip(colour_field * (1 - amount) + rgb(sky)[None, None, :] * amount, 0, 1)


# ---------------------------------------------------------------------------
# Masses
# ---------------------------------------------------------------------------

def canopy(shape: tuple[int, int], cover: float = 0.55, lump: float = 26.0,
           seed: int = 0, bottom: float = 0.55) -> np.ndarray:
    """A ragged mass of leaves — the shape a tree crown makes against sky.

    Built by thresholding noise rather than drawing leaves: at the scale a
    background canopy occupies, individual leaves are smaller than a pixel and
    what the eye reads is the clumping, which noise gives for free.
    """
    n = fbm(shape, octaves=5, base=lump, seed=seed)
    _, y = coords(shape)
    # Thin toward the bottom so the mass sits in the upper frame like a crown.
    bias = np.clip((bottom - y) / max(bottom, 1e-3), 0, 1) ** 0.6
    m = np.clip((n - (1 - cover)) * 6.0, 0, 1) * bias
    return gaussian_filter(m, 1.2).astype(np.float32)


def conifers(shape: tuple[int, int], count: int, base_y: float, height: float,
             width: float, seed: int = 0, jitter: float = 0.5) -> np.ndarray:
    """A row of spruce silhouettes. Tapered, notched, never identical."""
    rng = np.random.default_rng(seed)
    h, w = shape
    x, y = coords(shape)
    out = np.zeros(shape, dtype=np.float32)
    for i in range(count):
        cx = (i + 0.5) / count + rng.uniform(-0.5, 0.5) / count * jitter
        hh = height * rng.uniform(0.62, 1.35)
        ww = width * rng.uniform(0.7, 1.3)
        top = base_y - hh
        t = np.clip((base_y - y) / max(hh, 1e-4), 0, 1)          # 0 at foot, 1 at tip
        # Half-width tapers to the tip, with notched branch tiers.
        tiers = 0.78 + 0.22 * np.cos(t * np.pi * rng.uniform(7, 12))
        half = ww * (1 - t) ** 0.78 * tiers
        body = (np.abs(x - cx) < half) & (y < base_y) & (y > top)
        out = np.maximum(out, body.astype(np.float32))
    return gaussian_filter(out, 0.8)


def trunks(shape: tuple[int, int], count: int, seed: int = 0,
           width: float = 0.012, lean: float = 0.05) -> np.ndarray:
    """Vertical trunks receding into a wood, slightly leaning and tapered."""
    rng = np.random.default_rng(seed)
    x, y = coords(shape)
    out = np.zeros(shape, dtype=np.float32)
    for _ in range(count):
        cx = rng.uniform(-0.05, 1.05)
        ww = width * rng.uniform(0.45, 1.7)
        ln = rng.uniform(-lean, lean)
        top = rng.uniform(-0.2, 0.15)
        bot = rng.uniform(0.7, 1.2)
        centre = cx + ln * (y - top)
        taper = ww * (1.0 - 0.35 * np.clip((y - top) / max(bot - top, 1e-3), 0, 1))
        out = np.maximum(out, ((np.abs(x - centre) < taper) & (y > top) & (y < bot)).astype(np.float32))
    return gaussian_filter(out, 0.7)


def foliage(shape: tuple[int, int], count: int, cx: float, cy: float,
            spread: float, size: float, seed: int = 0,
            droop: float = 0.0) -> np.ndarray:
    """A clump of leaf blades radiating from a point — fern, grass tuft, frond.

    Each blade is an anisotropic gaussian rotated to its own angle, which gives
    a soft tapered stroke far cheaper than drawing a polygon and, blurred into
    a mass, reads correctly at plate scale.
    """
    rng = np.random.default_rng(seed)
    x, y = coords(shape)
    out = np.zeros(shape, dtype=np.float32)
    h, w = shape
    ar = w / h
    for _ in range(count):
        ang = rng.uniform(-np.pi, np.pi)
        ln = size * rng.uniform(0.55, 1.45)
        ox = cx + rng.normal(0, spread) * ar
        oy = cy + rng.normal(0, spread)
        # Blade direction, bent downward by `droop` along its length.
        dx, dy = np.cos(ang), np.sin(ang) + droop
        norm = np.hypot(dx, dy) + 1e-6
        dx, dy = dx / norm, dy / norm
        px, py = (x - ox) / ar, y - oy
        along = px * dx + py * dy
        across = -px * dy + py * dx
        blade = np.exp(-(along / ln) ** 2 * 2.2) * np.exp(-(across / (ln * 0.055)) ** 2)
        blade *= np.clip(along / ln + 0.35, 0, 1)   # taper to a tip
        out = np.maximum(out, blade.astype(np.float32))
    return out


def grass(shape: tuple[int, int], count: int, base_y: float, height: float,
          seed: int = 0, spread: float = 1.0, bend: float = 0.35) -> np.ndarray:
    """A band of standing grass, each blade bending from its own root."""
    rng = np.random.default_rng(seed)
    x, y = coords(shape)
    h, w = shape
    ar = w / h
    out = np.zeros(shape, dtype=np.float32)
    for _ in range(count):
        rx = rng.uniform(0.5 - spread / 2, 0.5 + spread / 2)
        ry = base_y + rng.uniform(-0.02, 0.03)
        hh = height * rng.uniform(0.45, 1.5)
        lean = rng.uniform(-bend, bend)
        t = np.clip((ry - y) / max(hh, 1e-4), 0, 1)
        centre = rx + lean * t ** 1.7 / ar
        half = (0.0016 + 0.0032 * (1 - t)) / ar
        blade = ((np.abs(x - centre) < half) & (y < ry) & (y > ry - hh)).astype(np.float32)
        out = np.maximum(out, blade)
    return gaussian_filter(out, 0.6)


# ---------------------------------------------------------------------------
# Surfaces the product can rest on
# ---------------------------------------------------------------------------

def log_slab(shape: tuple[int, int], top_y: float, tilt: float = 0.0,
             thickness: float = 0.34, seed: int = 0,
             end_x: float | None = None) -> np.ndarray:
    """A fallen log or cut slab crossing the frame: the product's surface.

    The top edge is a gently noisy line rather than a ruler, and the body runs
    to the bottom of the frame, so the knife has something with real thickness
    under it instead of a floating shelf.
    """
    x, y = coords(shape)
    h, w = shape
    rng = np.random.default_rng(seed)
    n = gaussian_filter(rng.standard_normal(w).astype(np.float32), sigma=w * 0.04)
    n /= (np.abs(n).max() + 1e-6)
    edge = top_y + tilt * (np.linspace(0, 1, w) - 0.5) + n * 0.012
    top = edge[None, :].repeat(h, axis=0)
    body = np.clip((y - top) * h / 1.4, 0, 1)
    if end_x is not None:
        body *= np.clip((end_x - x) * w / 3.0, 0, 1)
    below_bottom = np.clip((top + thickness - y) * h / 1.4, 0, 1)
    return (body * np.maximum(below_bottom, 0.0)).astype(np.float32)


def stone_ledge(shape: tuple[int, int], top_y: float, seed: int = 0,
                roughness: float = 0.03) -> np.ndarray:
    """A blockier, more angular surface than a log — weathered rock."""
    x, y = coords(shape)
    h, w = shape
    rng = np.random.default_rng(seed)
    steps = rng.uniform(-1, 1, 7)
    prof = np.interp(np.linspace(0, 1, w), np.linspace(0, 1, 7), steps)
    prof = gaussian_filter(prof, sigma=w * 0.012)
    edge = top_y + prof * roughness
    return np.clip((y - edge[None, :].repeat(h, axis=0)) * h / 1.6, 0, 1).astype(np.float32)


def bark(shape: tuple[int, int], seed: int = 0, along: str = "x",
         strength: float = 1.0) -> np.ndarray:
    """Directional ridged texture: long fissures with short cross-cracks."""
    rng = np.random.default_rng(seed)
    n = rng.standard_normal(shape).astype(np.float32)
    if along == "x":
        ridge = gaussian_filter(n, sigma=(1.0, 26.0))
        cross = gaussian_filter(rng.standard_normal(shape).astype(np.float32), sigma=(9.0, 1.2))
    else:
        ridge = gaussian_filter(n, sigma=(26.0, 1.0))
        cross = gaussian_filter(rng.standard_normal(shape).astype(np.float32), sigma=(1.2, 9.0))
    r = ridge / (np.abs(ridge).max() + 1e-6)
    c = cross / (np.abs(cross).max() + 1e-6)
    return np.clip(0.5 + (r * 0.85 + c * 0.30) * strength * 0.5, 0, 1).astype(np.float32)


def rings(shape: tuple[int, int], cx: float, cy: float, count: float = 22.0,
          wobble: float = 0.05, seed: int = 0) -> np.ndarray:
    """Growth rings on a cut end or burl face."""
    x, y = coords(shape)
    h, w = shape
    ar = w / h
    r = np.hypot((x - cx) / ar, y - cy)
    r = r + fbm(shape, octaves=4, base=34, seed=seed) * wobble
    return (0.5 + 0.5 * np.cos(r * count * 2 * np.pi)).astype(np.float32)


def moss(shape: tuple[int, int], density: float = 0.5, seed: int = 0,
         clump: float = 9.0) -> np.ndarray:
    """Fine clumpy growth, for the damp side of a log or the base of stone."""
    n = fbm(shape, octaves=6, base=clump, seed=seed)
    m = np.clip((n - (1 - density)) * 5.0, 0, 1)
    speckle = fbm(shape, octaves=3, base=2.2, seed=seed + 7)
    return np.clip(m * (0.55 + 0.65 * speckle), 0, 1).astype(np.float32)


def pebbles(shape: tuple[int, int], count: int, cy: float, spread: float,
            size: float, seed: int = 0) -> np.ndarray:
    """Scattered rounded stones, flattened by perspective."""
    rng = np.random.default_rng(seed)
    x, y = coords(shape)
    h, w = shape
    ar = w / h
    out = np.zeros(shape, dtype=np.float32)
    for _ in range(count):
        px = rng.uniform(0, 1)
        py = cy + rng.normal(0, spread)
        rx = size * rng.uniform(0.5, 1.6)
        ry = rx * rng.uniform(0.4, 0.7)
        d = ((x - px) / (rx / ar)) ** 2 + ((y - py) / ry) ** 2
        out = np.maximum(out, np.clip(1.4 - d, 0, 1) ** 0.6)
    return out.astype(np.float32)


# ---------------------------------------------------------------------------
# Light and air
# ---------------------------------------------------------------------------

def shafts(shape: tuple[int, int], origin: tuple[float, float], count: int = 7,
           spread: float = 0.55, angle: float = 1.15, seed: int = 0,
           softness: float = 26.0) -> np.ndarray:
    """Light coming through a canopy gap: a fan of soft beams from a point."""
    rng = np.random.default_rng(seed)
    x, y = coords(shape)
    h, w = shape
    ar = w / h
    ox, oy = origin
    px, py = (x - ox) * ar, y - oy
    theta = np.arctan2(py, px)
    out = np.zeros(shape, dtype=np.float32)
    for _ in range(count):
        a = angle + rng.normal(0, spread * 0.5)
        width = rng.uniform(0.02, 0.075)
        beam = np.exp(-((np.abs(theta - a)) / width) ** 2)
        out += beam * rng.uniform(0.45, 1.0)
    fade = np.clip(1.0 - np.hypot(px, py) * 0.75, 0, 1) ** 1.4
    return gaussian_filter(out * fade, softness).astype(np.float32)


def dapple(shape: tuple[int, int], scale: float = 46.0, cover: float = 0.42,
           seed: int = 0, softness: float = 5.0) -> np.ndarray:
    """Broken light and shadow thrown by leaves onto a surface."""
    n = fbm(shape, octaves=4, base=scale, seed=seed)
    m = np.clip((n - (1 - cover)) * 4.5, 0, 1)
    return gaussian_filter(m, softness).astype(np.float32)


def bokeh(shape: tuple[int, int], count: int, cy: float, spread: float,
          size: float, seed: int = 0) -> np.ndarray:
    """Out-of-focus highlights.

    The strongest single cue that a plate was photographed with a real lens
    rather than drawn: bright points behind the focal plane open into soft
    discs with a slightly brighter rim.
    """
    rng = np.random.default_rng(seed)
    x, y = coords(shape)
    h, w = shape
    ar = w / h
    out = np.zeros(shape, dtype=np.float32)
    for _ in range(count):
        px = rng.uniform(-0.05, 1.05)
        py = cy + rng.normal(0, spread)
        r = size * rng.uniform(0.45, 1.8)
        d = np.hypot((x - px) * ar, y - py) / max(r, 1e-4)
        disc = np.clip(1.0 - d, 0, 1)
        disc = np.clip(disc * 3.2, 0, 1) ** 0.55        # flat centre, soft edge
        disc += np.clip(1.0 - np.abs(d - 0.88) * 9.0, 0, 1) * 0.5   # rim
        out += disc * rng.uniform(0.25, 1.0)
    return gaussian_filter(out, 2.2).astype(np.float32)


def water_bands(shape: tuple[int, int], top_y: float, seed: int = 0,
                count: float = 26.0) -> np.ndarray:
    """Horizontal reflected light on moving water, compressed with distance."""
    x, y = coords(shape)
    depth = np.clip((y - top_y) / max(1 - top_y, 1e-3), 0, 1)
    phase = depth ** 0.55 * count * 2 * np.pi
    wobble = fbm(shape, octaves=4, base=30, seed=seed) * 2.4
    band = 0.5 + 0.5 * np.sin(phase + wobble)
    band = band ** 2.6
    return (band * np.clip(depth * 2.2, 0, 1)).astype(np.float32)


def haze_band(shape: tuple[int, int], centre: float, thickness: float,
              seed: int = 0) -> np.ndarray:
    """A drifting stratum of mist, thicker in places, for the middle distance."""
    _, y = coords(shape)
    band = np.exp(-((y - centre) ** 2) / max(thickness, 1e-4))
    clumps = 0.35 + 0.65 * fbm(shape, octaves=4, base=120, seed=seed)
    return (band * clumps).astype(np.float32)


def smoke(shape: tuple[int, int], cx: float, base_y: float, height: float,
          width: float, seed: int = 0) -> np.ndarray:
    """A thin column of smoke widening and fading as it rises."""
    x, y = coords(shape)
    h, w = shape
    ar = w / h
    t = np.clip((base_y - y) / max(height, 1e-4), 0, 1)
    drift = (fbm(shape, octaves=4, base=60, seed=seed) - 0.5) * 0.22
    centre = cx + drift * t
    half = width * (0.25 + 1.9 * t)
    col = np.exp(-(((x - centre) * ar) / np.maximum(half, 1e-4)) ** 2)
    return (col * np.clip(t * 3.0, 0, 1) * (1 - t) ** 0.55 *
            (0.4 + 0.6 * fbm(shape, octaves=4, base=40, seed=seed + 3))).astype(np.float32)


# ---------------------------------------------------------------------------
# Lens
# ---------------------------------------------------------------------------

def defocus(colour: np.ndarray, radius: float) -> np.ndarray:
    """Blur a colour layer as a lens would: highlights bloom rather than smear.

    Averaging in linear light and letting bright pixels spread first is what
    separates a defocused photograph from a gaussian-blurred drawing.
    """
    if radius <= 0:
        return colour
    lin = np.clip(colour, 0, 1) ** 2.2
    spread = maximum_filter(lin, size=(max(int(radius * 0.55), 1),
                                       max(int(radius * 0.55), 1), 1))
    lin = lin * 0.72 + spread * 0.28
    for c in range(3):
        lin[..., c] = gaussian_filter(lin[..., c], radius)
    return np.clip(lin, 0, 1) ** (1 / 2.2)


def defocus_alpha(alpha: np.ndarray, radius: float) -> np.ndarray:
    return gaussian_filter(alpha, radius) if radius > 0 else alpha


def expose(img: np.ndarray, stops: float = 0.0, lift: float = 0.0,
           contrast: float = 1.0) -> np.ndarray:
    """Exposure, shadow lift and contrast, in that order.

    `lift` is what keeps these scenes from crushing to black: it raises the
    floor so shadow detail survives instead of being clipped to make text pop.
    """
    out = np.clip(img, 0, 1) * (2.0 ** stops)
    out = out * (1 - lift) + lift
    mid = 0.46
    out = np.clip((out - mid) * contrast + mid, 0, 1)
    return out.astype(np.float32)
