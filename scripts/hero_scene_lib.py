"""Rendering primitives for the hero scene plates.

Everything here is procedural: fractal noise, displaced silhouettes and
directional light. No photograph is redrawn and no product is generated —
these build the *environment* the real knife cutout is placed into.
"""

from __future__ import annotations

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter


# --------------------------------------------------------------------------
# noise
# --------------------------------------------------------------------------

def fbm(shape: tuple[int, int], octaves: int = 5, persistence: float = 0.55,
        base: float = 90.0, seed: int = 0) -> np.ndarray:
    """Fractal noise in [0, 1]. Built from blurred white noise so the result is
    smooth at large scale and grainy at small scale, like real atmosphere."""
    rng = np.random.default_rng(seed)
    h, w = shape
    out = np.zeros((h, w), dtype=np.float32)
    amp, total, sigma = 1.0, 0.0, base
    for _ in range(octaves):
        layer = gaussian_filter(rng.random((h, w), dtype=np.float32), sigma=max(sigma, 0.7))
        lo, hi = layer.min(), layer.max()
        if hi > lo:
            layer = (layer - lo) / (hi - lo)
        out += amp * layer
        total += amp
        amp *= persistence
        sigma *= 0.5
    return out / total


def grain(shape: tuple[int, int], sigma: float = 0.6, seed: int = 1) -> np.ndarray:
    """Zero-centred fine grain, the thing that separates a photograph from a
    CSS gradient."""
    rng = np.random.default_rng(seed)
    g = gaussian_filter(rng.standard_normal(shape).astype(np.float32), sigma=sigma)
    return g / (np.abs(g).max() + 1e-6)


# --------------------------------------------------------------------------
# fields
# --------------------------------------------------------------------------

def coords(shape: tuple[int, int]) -> tuple[np.ndarray, np.ndarray]:
    """Normalised x, y grids in [0, 1]."""
    h, w = shape
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return x / max(w - 1, 1), y / max(h - 1, 1)


def radial(shape: tuple[int, int], cx: float, cy: float, rx: float, ry: float,
           falloff: float = 2.0) -> np.ndarray:
    """Soft elliptical pool of light in [0, 1], 1 at the centre."""
    x, y = coords(shape)
    d = np.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2)
    return np.clip(1.0 - d, 0.0, 1.0) ** falloff


def vertical(shape: tuple[int, int], top: float, bottom: float,
             gamma: float = 1.0) -> np.ndarray:
    _, y = coords(shape)
    return top + (bottom - top) * (y ** gamma)


def horizontal(shape: tuple[int, int], left: float, right: float,
               gamma: float = 1.0) -> np.ndarray:
    x, _ = coords(shape)
    return left + (right - left) * (x ** gamma)


# --------------------------------------------------------------------------
# silhouettes
# --------------------------------------------------------------------------

def profile(width: int, points: list[tuple[float, float]], roughness: float,
            detail: float, seed: int) -> np.ndarray:
    """A horizon line across `width`, interpolated through `points`
    (x, y in [0, 1]) and then displaced by noise so it reads as rock or
    terrain rather than a polygon."""
    xs = np.array([p[0] for p in points], dtype=np.float32)
    ys = np.array([p[1] for p in points], dtype=np.float32)
    t = np.linspace(0.0, 1.0, width, dtype=np.float32)
    line = np.interp(t, xs, ys).astype(np.float32)

    rng = np.random.default_rng(seed)
    disp = np.zeros(width, dtype=np.float32)
    amp, sigma = roughness, detail * width
    for _ in range(5):
        n = gaussian_filter(rng.standard_normal(width).astype(np.float32),
                            sigma=max(sigma, 0.8))
        n /= (np.abs(n).max() + 1e-6)
        disp += amp * n
        amp *= 0.5
        sigma *= 0.42
    return np.clip(line + disp, -0.2, 1.2)


def below(shape: tuple[int, int], line: np.ndarray, feather: float = 1.2) -> np.ndarray:
    """Mask of everything under a horizon line, with a one-pixel-ish feather so
    the edge is clean but not aliased."""
    h, w = shape
    _, y = coords(shape)
    edge = line[np.newaxis, :].repeat(h, axis=0)
    m = np.clip((y - edge) * h / max(feather, 0.2), 0.0, 1.0)
    return m.astype(np.float32)


def blob(shape: tuple[int, int], cx: float, cy: float, rx: float, ry: float,
         roughness: float = 0.18, seed: int = 0, power: float = 1.0) -> np.ndarray:
    """An irregular rounded mass — boulders, logs, out-of-focus blocks."""
    x, y = coords(shape)
    n = fbm(shape, octaves=4, base=shape[0] * 0.16, seed=seed)
    d = np.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2)
    d = d * (1.0 + roughness * (n - 0.5) * 2.0)
    return np.clip((1.0 - d) * 40.0, 0.0, 1.0) ** power


def bar(shape: tuple[int, int], x0: float, y0: float, x1: float, y1: float,
        thickness: float) -> np.ndarray:
    """Distance mask for a rounded bar between two points — used for rebar,
    bench edges and cord."""
    h, w = shape
    x, y = coords(shape)
    aspect = w / h
    px, py = x * aspect, y
    ax, ay = x0 * aspect, y0
    bx, by = x1 * aspect, y1
    dx, dy = bx - ax, by - ay
    denom = dx * dx + dy * dy + 1e-9
    t = np.clip(((px - ax) * dx + (py - ay) * dy) / denom, 0.0, 1.0)
    d = np.sqrt((px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2)
    return np.clip((thickness - d) * (h * 0.5), 0.0, 1.0)


# --------------------------------------------------------------------------
# colour
# --------------------------------------------------------------------------

def rgb(hex_code: str) -> np.ndarray:
    h = hex_code.lstrip("#")
    return np.array([int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], dtype=np.float32)


def tint(mask: np.ndarray, colour: str) -> np.ndarray:
    """mask (h, w) -> (h, w, 3) of one colour."""
    return mask[..., np.newaxis] * rgb(colour)[np.newaxis, np.newaxis, :]


def screen(base: np.ndarray, layer: np.ndarray) -> np.ndarray:
    return 1.0 - (1.0 - base) * (1.0 - layer)


def over(base: np.ndarray, colour: str, alpha: np.ndarray) -> np.ndarray:
    a = alpha[..., np.newaxis]
    return base * (1.0 - a) + rgb(colour)[np.newaxis, np.newaxis, :] * a


def save_rgb(arr: np.ndarray, path: str, quality: int = 80) -> None:
    img = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8), mode="RGB")
    img.save(path, "WEBP", quality=quality, method=6)


def save_rgba(rgb_arr: np.ndarray, alpha: np.ndarray, path: str,
              quality: int = 80) -> None:
    h, w = alpha.shape
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[..., :3] = (np.clip(rgb_arr, 0, 1) * 255).astype(np.uint8)
    out[..., 3] = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(out, mode="RGBA").save(path, "WEBP", quality=quality, method=6)


def streaks(shape: tuple[int, int], angle: float = 0.0, length: float = 0.10,
            fineness: float = 0.004, seed: int = 0) -> np.ndarray:
    """Directional grain — wood, char, brushed metal, wind.

    Real grain is irregular. A sine wave is not: it reads as corrugation. This
    smears fine noise along one axis instead, which gives varying line widths
    and broken runs the way actual material does.
    """
    h, w = shape
    rng = np.random.default_rng(seed)
    n = rng.random((h, w)).astype(np.float32)
    n = gaussian_filter(n, sigma=(max(fineness * h, 0.6), max(length * w, 1.0)))
    lo, hi = n.min(), n.max()
    n = (n - lo) / (hi - lo + 1e-6)
    if abs(angle) > 1e-3:
        from scipy.ndimage import rotate as _rot
        big = _rot(n, angle, reshape=False, order=1, mode="reflect")
        n = big
    return n.astype(np.float32)


def rect(shape: tuple[int, int], x0: float, y0: float, x1: float, y1: float,
         soften: float = 1.5) -> np.ndarray:
    """Axis-aligned mass. Man-made objects (an anvil, a bench, a block) have
    straight edges; forcing them out of ellipses is what made them read as
    eggs."""
    h, w = shape
    x, y = coords(shape)
    inside = ((x >= x0) & (x <= x1) & (y >= y0) & (y <= y1)).astype(np.float32)
    return gaussian_filter(inside, soften) if soften else inside


def rim(mask: np.ndarray, lx: float, ly: float, width: float = 9.0) -> np.ndarray:
    """Light catching one side of a silhouette.

    A plain difference-of-gaussians rings the whole shape, which is why small
    masses came out looking like haloed ovals. Weighting by the surface normal
    keeps the highlight on the side actually facing the light.
    """
    edge = np.clip(gaussian_filter(mask, width * 0.25) - gaussian_filter(mask, width), 0, 1)
    gy, gx = np.gradient(gaussian_filter(mask, width * 0.5))
    norm = np.sqrt(gx * gx + gy * gy) + 1e-6
    facing = np.clip(-(gx / norm) * lx - (gy / norm) * ly, 0.0, 1.0)
    return edge * facing
