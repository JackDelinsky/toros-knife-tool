# Hero environment asset brief

What a real environment plate has to be before it replaces the neutral field
the hero ships with today, and how to commission one.

## Why the hero is currently a studio field

Two passes tried to put the knives in a landscape. Both failed, and the
reasons are worth keeping so the third attempt does not repeat them.

**Procedural rendering.** Drawing wilderness from noise, terrain and light
produced an illustration. At thumbnail size it read; at hero size it read as
clip art. It was discarded before it shipped.

**Enlarging the product photographs.** Every knife was shot outdoors on a real
weathered stump, so the second attempt used the largest knife-free rectangle
of each photograph as the environment. The material was genuine, but a ~700px
crop stretched to 1920 is soft no matter how it is graded; the join between
the sharp surface and the blurred background read as a hard horizontal seam
across every slide; and the knives floated on that seam instead of resting
anywhere. That is what is being removed.

The honest alternative to a bad landscape is not a worse landscape. It is a
deliberate studio field: a deep ground that varies per product, one warm key
behind the knife in the knife's own accent colour, a restrained vignette, and
fine grain. It is entirely CSS, it weighs nothing, it has no seam, and it does
not claim to be a photograph of anywhere.

## The gate

A plate enters production only if **every** line is true. A plate that fails
any one of them makes the hero worse than the field it replaces.

| # | Requirement |
|---|---|
| 1 | At least **2560×1440**, preferably 3840×2160. Native capture, not upscaled. |
| 2 | **No knife, sheath, hand, tool, person, animal, logo or text baked in.** The product is composited at runtime. |
| 3 | A coherent outdoor space with a **recognisable ground plane** — a stump, ledge or stone at a believable size for a knife. |
| 4 | **Negative space at far left and far right** for the copy and the purchase column, and an open centre for the product. |
| 5 | Detailed enough to survive the final crop **without heavy blur**. If it needs blur to look acceptable, it fails. |
| 6 | Lit from **one clear direction** that the knife's own lighting and contact shadow can be matched to. |
| 7 | Clearly different from the other six in season, weather, time of day or composition. |

Do not use the existing 720p product photographs as plates. They are the
source of the knife cutouts and nothing else.

## Per-knife identities

One or two cues each. Never all of them at once.

| Knife | Environment | Restrained motion |
|---|---|---|
| Toros Jellybean | Bright spring creek, wet river stone, small jewel-like colour in the foliage | Slow water glint, one or two drifting motes |
| BOS Stag Golden Horn | Golden autumn highland woodland, warm stump, dry grass | One falling leaf, slow sun shift |
| Sakra Bear Claw | Cool evergreen edge or mountain campsite | Slight branch movement. No literal bear, paw or fur |
| Misty Stubby Giraffe | Misty early-morning woodland edge, warm patterned light | Mist breathing, one grass movement |
| Misty Rebar Shank | Rain-washed stone and hardy vegetation, restrained forged undertone | A few water highlights |
| GUR Tuva | Open high plateau, windswept grass, distant terrain | Slow cloud light, very restrained grass |
| GUR Tombik | Warm late-summer woodland, rounded stump and stone, deep greens and amber | Slow dappled light, one leaf |

## Commissioning prompt

For a generator, or as a brief for a photographer:

> Photorealistic premium outdoor product-photography environment for a
> handcrafted knife website, widescreen 16:9. A correctly scaled weathered
> stump, stone or natural resting plane near the lower middle, layered real
> wilderness depth, crisp restrained detail, bright but cinematic natural
> light, darker quiet negative space at far left and far right for readable
> editorial copy, open centre for a separately composited knife, believable
> contact plane.
>
> Negative: no knife, no sheath, no tools, no hands, no people, no animals, no
> text, no logo, no giant macro wood texture, no artificial bokeh wall, no
> fantasy glow, no excessive fog.

## How to add one

1. Drop the plate at `public/images/hero/scenes/<slug>-plate.webp`.
2. Add `plate`, and the measured light direction, to that knife's entry in
   `lib/hero-scenes.ts`.
3. The scene component renders the plate under the existing key and vignette
   when the field is present, and falls back to the studio field when it is
   not. **Do one knife first and look at it at 1280×800 and 390×844 before
   commissioning the other six.**

## The cheaper thing to do first

Before any of this: **camera originals of the seven product photographs.**
Everything on the site was cropped from phone screenshots of the old
storefront. Sharper cutouts would improve every surface — hero, shop, product
page and inspect — at no design cost and no new art direction. That is the
highest-value asset request on this project, and it is a folder of files
rather than a shoot.
