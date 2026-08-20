# Product image sources

Source images for building Toros Knife & Tool website product photos.

## Folder layout

| Folder | Files | Description |
|--------|-------|-------------|
| `*.jpeg` | 58 | Full-resolution mobile toroskt.com screenshots (706×1536) |
| `chat-screenshots/` | 30 | Additional screenshots from chat uploads (470×1024, unique vs JPEG set) |
| `product-photos/` | 15 | Clean product shots from chat — no browser UI (1024×768 landscape) |
| `cleaned-png/` | 16 | Pre-cropped ChatGPT extractions from Downloads (highest quality) |

## Website output (when processed)

Processed images go to:

`public/images/products/{slug}.jpg`

Example slugs: `bos-deri.jpg`, `kam-ram.jpg`, `gur-tuva.jpg`, `misty-stubby-giraffe.jpg`

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/import-chat-images.py` | Pull new unique images from Cursor chat uploads + sync Downloads |
| `scripts/process-product-images.py` | Crop product photo regions from mobile screenshots |
| `scripts/export-product-images.py` | Enhance, fit to 3:4 card ratio, export to `public/images/products/` |

Run from project root:

```bash
python3 scripts/import-chat-images.py
python3 scripts/process-product-images.py
python3 scripts/export-product-images.py
```

**Priority for final exports:** `cleaned-png/` and `product-photos/` first (already clean), then cropped screenshots.

Do not link raw screenshots in the site — only cleaned exports in `public/images/products/`.
