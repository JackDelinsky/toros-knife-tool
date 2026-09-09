# Hero scene asset brief

The homepage hero places each knife inside its own environment, built from
three separately-composited layers plus a runtime lighting pass:

| Layer | File | Size | Notes |
|---|---|---|---|
| Background plate | `public/images/hero/scenes/{slug}-plate.webp` | 1920×1080 | Opaque. Sky, wall, air, and the scene's light. |
| Middle ground | `public/images/hero/scenes/{slug}-mid.webp` | 1920×1080 | **Alpha.** Terrain, bench, anvil. Transparent above the horizon. |
| Foreground | `public/images/hero/scenes/{slug}-fore.webp` | 1600×460 | **Alpha.** Anchored to the bottom, composited *above* the knife. |

The product cutout sits between the middle ground and the foreground. It is a
masked photograph and must stay one — see `docs/hero-asset-audit.md`.

## What is shipping today, and what it is not

No image-generation capability was available in the session that built this, so
the plates are **procedurally rendered**, not photographed: fractal terrain,
directional light and material grain drawn by `scripts/build-hero-scenes.py`
(primitives in `scripts/hero_scene_lib.py`). Re-run with
`python3 scripts/build-hero-scenes.py [slug ...]`.

That is deliberately not disguised. The current plates give real depth,
per-knife light and materially distinct worlds at ~340 KB for all 21 layers,
and they are a genuine improvement on the CSS gradients they replaced. They are
**not** photography, and a real plate would beat them on texture, incidental
detail and believability. What follows is what to shoot or commission.

## Per-knife scene direction

Each entry lists the world, the key light, and what a replacement plate needs.
Configuration lives in one place — `components/home/hero/hero-knives.ts` — so
swapping a plate is changing a path, not editing JSX or CSS.

### Safe zones, all scenes

At ≥1024px the knife occupies the centre third and the copy the outer thirds,
so **keep the outer 30% of the frame quiet** — no high-contrast detail there,
or the headline and price lose contrast. Below 1024px the plate is cropped to
`object-position: 50% 64%` and the middle ground is laid across the bottom 46%
of the hero at `object-fit: contain`, so **the horizon must sit in the lower
third of the mid layer** or it disappears on a phone.

| Knife | World | Key light | Missing plate |
|---|---|---|---|
| Toros Jellybean | Charred walnut log on a mossy forest floor | Cool canopy gap from upper-left, one warm edge from the right | Damp forest floor, macro scale. Real moss, leaf litter, charred bark. |
| BOS Stag Golden Horn | Three receding Taurus ridgelines | Low amber sunrise behind the ridges, dust at each depth | Genuine mountain layers at dawn, haze separating each plane. |
| Sakra Bear Claw | Cold weathered crag, high moon | Moonlight from upper-right, warm glint along the blade | Stone with real fracture and lichen. Leather cord is a foreground element. |
| Misty Stubby Giraffe | The maker's bench | Warm bench lamp upper-left, cool accent from the right | Aydin's actual bench, shot at f/2 so blocks and tools go soft. |
| Misty Rebar Shank | Forge floor at night | Forge mouth low-right, cold blackened steel elsewhere | A real forge and anvil. Sparks captured, not added. |
| GUR Tuva | Open windswept highland | Pale directional daylight, deep charcoal ground shadow | Wide, quiet, high horizon. The one scene that should feel empty. |
| GUR Tombik | Walnut slab and rounded stone | Copper side light from the left, low ember far right | Real walnut end-grain and river stone, raking light. |

## Requirements for a replacement plate

- **Resolution** 3840×2160 supplied, downsampled to 1920×1080 for the plate.
- **Format** WebP, quality 80–85. Budget ≤120 KB per layer; a full scene
  should stay under ~150 KB so the first viewport is not megabytes.
- **Middle ground and foreground need real alpha.** Shoot against a
  contrasting backdrop or mask by hand — do not deliver a flattened image.
- **Light direction must match** the `keyX` / `keyY` values in
  `hero-knives.ts`, which drive the CSS lighting pass over the plate. Change
  one and change the other.
- **No knives in the plate.** Ever. The product is the only photographed
  object in the composition and it is composited separately.

## Still missing

- **Mobile-specific compositions.** Today the desktop plates are re-framed with
  CSS. A 1080×1920 portrait plate per scene would frame far better on a phone.
- **Photographic plates** for all seven, per the table above.
- **A foreground element per knife drawn from its own material** — shavings for
  the Giraffe and cord for the Bear Claw are represented; the rest are generic
  stone and litter forms.
