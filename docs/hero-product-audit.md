# Hero product data audit

Scope: the seven products featured in the homepage cinematic hero.

## Source-of-truth choice

**`data/products.ts` is the source of truth for this demo.** The hero renders
price, steel, handle, dimensions and stock from the canonical `Product` record
resolved via `getProductBySlug`. Nothing in
`components/home/hero/hero-knives.ts` restates those values — it holds only
presentation data (cutout, rotation, accent, environment).

## Verification status: INCOMPLETE

The brief asked for each record to be checked against its official product page
on `toroskt.com`. **That was not possible in this environment.** Outbound
requests to `toroskt.com` are refused by the network egress proxy:

```
curl https://toroskt.com/product/toros-jellybean/
curl: (56) CONNECT tunnel failed, response 403
```

So the seven records below are **unverified against the live store**. They were
checked only for internal consistency and against the product photography in
the repository. Anyone with normal network access should re-run this audit.

Pages that still need checking:

- https://toroskt.com/product/toros-jellybean/
- https://toroskt.com/product/bos-stag-golden-horn/
- https://toroskt.com/product/bear-claw-neck-knives/
- https://toroskt.com/product/misty-stubby-giraffe/
- https://toroskt.com/product/misty-rebar-shank/
- https://toroskt.com/product/gur-tuva/
- https://toroskt.com/product/gur-tombik/

## Local records as they stand

| Slug | Price | Steel | Handle | Blade | Overall | Stock |
|---|---|---|---|---|---|---|
| `toros-jellybean` | $30 | 4116 Steel | Epoxy | 1 ¾ in | 3 ½ in | in stock |
| `bos-stag-golden-horn` | $190 | N690 Steel | Antler and brass bolster | 4 ⅞ in | 9 ⅝ in | in stock |
| `sakra-bear-claw-neck-knives` | $140 | 4116 Steel | Stabilized resin / wood | ~2 in | ~4 in | in stock |
| `misty-stubby-giraffe` | $140 | 1084 Steel | Thuya Burl | 2 7/16 in | 5 5/16 in | in stock |
| `misty-rebar-shank` | $140 | Rebar | Rebar / optional paracord | N/A | 6 5/16 in (approx.) | in stock |
| `gur-tuva` | $265 | 1075 Carbon Steel | **Deer Antler** | 4 in | 8 9/16 in | in stock |
| `gur-tombik` | $225 | 1075 Carbon Steel | Turkish Walnut | 3 ½ in | 7 ½ in | in stock |

## Open discrepancies

### 1. `gur-tuva` — handle material contradicts the photograph (unresolved)

The record says **Deer Antler**. The product photograph
(`public/images/products/gur-tuva/main.jpg`) shows a **dark, straight-grained
wooden handle** with a visible wood figure — visually much closer to the walnut
handle on `gur-tombik` than to the antler handle on `bos-stag-golden-horn`,
which is unmistakably antler in its own photo.

This has **not been "fixed"**, per the brief: an image alone is not authority to
overwrite a record, and the correct value cannot be confirmed while the official
page is unreachable. Two possibilities remain open:

- the record is stale/incorrect and the handle is wood, or
- the photograph shows a different variant than the record describes.

**Consequence in the hero:** the `gur-tuva` hero line was written to avoid
claiming a handle material — "Four inches of 1075 carbon, sheathed in leather."
The specs panel still displays the canonical `handleMaterial`, so if the record
is wrong, the hero repeats that error until the record is corrected. Resolve the
record, not the hero copy.

### 2. `misty-rebar-shank` — price needs confirmation

Flagged in the brief as suspect. Locally it is **$140**, the same as
`sakra-bear-claw-neck-knives` and `misty-stubby-giraffe`. Nothing internal
contradicts it, but it could not be confirmed against the live store.

### 3. Multi-variant products displayed as a single item

`toros-jellybean` and `sakra-bear-claw-neck-knives` are photographed as groups
(three and five colourways). The hero shows one chosen colourway while the
record describes the product generally. If these are genuinely sold as
selectable variants, they need a `variants` array; `lib/demo-cart.ts` already
carries an optional `variantId` for that future.

### 4. `misty-rebar-shank` has `bladeLength: "N/A"`

Rendered specs skip `N/A` values rather than printing "N/A", so this product
shows Steel/Handle/Overall only. Cosmetic, not a data error.
