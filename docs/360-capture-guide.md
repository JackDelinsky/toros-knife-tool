# Shooting a knife for the 360 viewer

The viewer is built and working. What it needs is frames, and no amount of code
substitutes for them — this is the whole job.

## Why frames and not a 3D model

A 3D model of a knife is an object nobody made. To build one you either sculpt
it — inventing the grind, the tang, the pin placement, the hammer marks — or you
photogrammetry it, and a mirror-polished blade is close to the worst possible
subject for that: photogrammetry matches features between photographs, and the
features on polished steel are reflections, which move when the camera moves.
The blade is the part that would come out worst, and the blade is the product.

A turntable sequence has neither problem. Every frame is a photograph, so
turning the knife can only ever show what was really there.

## What the shoot has to produce

| | Minimum | Good | Why |
|---|---|---|---|
| Frames per knife | 24 (15° apart) | **36 (10°)** | Under 24 the rotation visibly steps. Past 48 the file weight stops paying for itself. |
| Long side | 2000 px | **3000 px** | The viewer ships frames at ~1100 px; shooting at 3000 leaves room to crop. |
| Format | max-quality JPEG | RAW | Same reason as every other photo here. |
| Weight, processed | — | ~25–40 KB/frame | 36 frames lands near 1.2 MB, loaded only when someone opens the closer look. |

## The rig

You do not need to buy a turntable. A **lazy Susan** from a kitchen shop works,
and so does a dinner plate on a smooth counter.

1. **Mark the angles.** Tape a paper circle to the platform with 36 marks 10°
   apart. Print a protractor, or step round by eye against a ruler — consistency
   matters more than precision, and the viewer does not care if the spacing is a
   degree off.
2. **Camera on a tripod, and do not touch it.** Not between frames, not to
   check focus. If the camera moves, the knife appears to jump.
3. **Camera height slightly above the knife**, looking down maybe 10–15°. Dead
   level makes a knife nearly disappear at the two end-on angles.
4. **Lock everything to manual**: exposure, white balance, focus, ISO. On
   auto, every frame is exposed slightly differently and the sequence flickers.
   This is the single most common way a turntable shoot fails.
5. **Backdrop the knife does not share a colour with.** A mid-grey or white
   sweep works for dark handles; deep grey works for pale antler. The masking
   step needs to tell them apart.
6. **Light stays with the room, not the knife.** Two diffused sources, one
   main and one fill, both fixed. The knife rotates; the lighting does not.
   That is what makes it read as one object turning rather than 36 photos.

## Shooting

- Rotate the platform one mark, take one frame, repeat. Do not move anything
  else.
- Keep the knife centred on the platform's axis of rotation. If it sits
  off-centre it will orbit rather than spin.
- Sheath on or off — pick one and stay with it for the whole sequence.
- Name the files so they sort in shooting order: `001.jpg`, `002.jpg`… Most
  cameras do this already.
- Do a test lap of 6 frames and process them before shooting all 36. It takes
  five minutes and catches a wrong exposure lock before it costs you the set.

## Processing

```bash
python3 scripts/build-spin-frames.py gur-tombik ~/shoots/tombik-turntable
```

It masks each frame, crops all of them to one shared box so the knife stays
pinned in place, resizes, and writes
`public/images/spin/gur-tombik/frame-000.webp` upward. It prints the exact line
to paste into `components/home/hero/hero-knives.ts`:

```ts
spin: { dir: "/images/spin/gur-tombik", frames: 36, width: 1100, height: 820 },
```

Add that to the knife's entry and the closer look switches from the single
static cutout to the turntable. Nothing else has to change; a knife without a
`spin` entry keeps working exactly as it does now.

## Checking it before the rig test comes down

Open the site with `?spin=rig-test` and open any knife's closer look. That
swaps in the calibration block rendered by
`scripts/build-spin-rig-test.py` — a machined test target, deliberately not a
knife — so you can confirm the drag, the keyboard and the loader all behave on
your machine before shooting anything.

## Which knife to shoot first

**GUR Tombik.** Its current cutout is the cleanest of the seven, it is one of
the higher-priced pieces, and its dark walnut handle separates well from a
light backdrop. Shoot it, look at it in the viewer, and decide whether the
other six are worth the afternoon before committing to them.

## What this does not fix

The turntable replaces the closer-look image only. The shop grid, the product
pages and the hero carousel still run on the existing photography, which is
documented in `docs/product-photo-reshoot-list.md` and is the larger quality
problem. A 360 view of a knife whose card photo is a crop from a phone
screenshot of a website is an odd pairing — if the choice is one or the other,
reshoot the stills first.
