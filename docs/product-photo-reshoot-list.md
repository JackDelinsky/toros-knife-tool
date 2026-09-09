# Product photo reshoot list

Every product photograph in the repository is a 900×1200 JPEG. That is the
ceiling on quality for the whole catalogue, and it is low: the actual
photograph inside each file is letterboxed, so the usable subject is smaller
still. Nothing here has been upscaled to hide that — an AI upscale invents
detail that was never in the frame, which on a product photograph means
inventing the product.

Measurements below come from `scripts/_product_photo_report.json`
(`python3 scripts/normalize-product-photos.py`) and
`scripts/_hero_cutout_report.json`.

## Priority 1 — the presentation is visibly compromised

### `toros-ram-horn`
The photograph is 812×394 inside the file: a 2.06 aspect, far wider than any
other. Filling the site's 4:3 card frame would cut 35% of the width away, and
the knife runs the full width — it would lose its tip. It is therefore
letterboxed onto the site surface, which is why this one card sits smaller
than every other card in the shop grid.

It also shows **two knives**, so the card for a single product displays a pair.

*Needs:* one knife, shot to fill a 4:3 frame, minimum 2400px on the long side.

### `toros-jellybean` (also the hero)
Usable subject region is roughly 136×433 before resampling — the smallest of
the seven hero products by a wide margin, and the source frame holds three
colourways, so one had to be isolated from a group shot.

*Needs:* the teal Jellybean alone, filling the frame, on a plain backdrop.

### `sakra-bear-claw-neck-knives` (also the hero)
The source shows five colourways together. The front pearl-handled knife was
isolated as the hero subject, so the product page and the hero show one knife
out of a photograph of five.

*Needs:* the single pearl-handled Bear Claw alone, plus its cord.

## Priority 2 — usable, with a known cost

| Slug | Issue |
|---|---|
| `toros-ceviz`, `toros-rhino`, `toros-shepherd-knife` | Content aspect 1.09; 18% of the height is cropped to reach the card frame. Nothing important is lost today, but there is no margin. |
| `bos-recurve-survivor`, `bos-stag-golden-horn`, `kam-ram`, `misty-stubby-giraffe` | Content aspect 1.50; 11% of the width is cropped. Fine, but the knife sits close to the frame edge. |
| `gur-tuva` | The cutout has ~76,000 soft-edge pixels — roughly seven times any other — so it would halo visibly on a light background. It is fine on the dark hero and nowhere else. |

## Priority 3 — data, not photography

`gur-tuva`'s record lists a **Deer Antler** handle, but the photograph shows
dark wood. One of the two is wrong. The record has not been overwritten,
because guessing would be worse than the disagreement. Hero copy for this knife
deliberately does not name a handle material. See
`docs/hero-product-audit.md`.

## Products with no photograph at all

These have catalogue entries and empty image folders. They do not appear in the
shop today, but if one is ever published it will render a broken frame:

`anatolian-hunter`, `bazaar-folder`, `caravan-slipjoint`, `custom-commission`,
`heritage-display-piece`, `nomad-neck-knife`, `steppe-hatchet`,
`steppe-shadow`, `toros-camp-axe`, `toros-field-cleaver`

## Also worth knowing

`public/images/brand/` and `public/images/categories/` contain **13 filenames
for 5 distinct images**. `brand/hero.png`, `brand/collector.png` and
`categories/fixed-blades.png` are byte-identical, as are `brand/email.png`,
`brand/event.png`, `brand/heritage.png` and `categories/custom-knives.png`.
Any design that shows two of those at once will show the same picture twice.
The current pages avoid it, but the duplication is a trap.
