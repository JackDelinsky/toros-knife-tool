#!/usr/bin/env python3
"""Export final website product images — full knife visible in card frame."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional, Tuple

from PIL import Image

from product_card_fit import COVERAGE, enhance, expand_box, fit_card_contain

ASSETS = Path(__file__).resolve().parent.parent / "assets/product-screenshots"
STAGING = Path(__file__).resolve().parent / "_staging_crops"
STAGING_META = Path(__file__).resolve().parent / "_staging_meta.json"
SCREENSHOTS = ASSETS
OUT = Path(__file__).resolve().parent.parent / "public/images/products"


def load_staging_meta() -> dict[str, dict]:
    if not STAGING_META.exists():
        return {}
    items = json.loads(STAGING_META.read_text())
    keyed: dict[str, dict] = {}
    for item in items:
        hash_key = item["file"].replace(".jpg", "").split("_")[-1]
        keyed[hash_key] = item
    return keyed


def hash_from_crop_filename(crop_filename: str) -> str:
    return crop_filename.replace(".jpg", "").split("_")[-1]


def export_source(
    slug: str,
    path: Path,
    crop_box: Optional[Tuple[int, int, int, int]] = None,
) -> None:
    img = Image.open(path).convert("RGB")
    if crop_box:
        img = img.crop(crop_box)
    img = enhance(fit_card_contain(img))
    out_flat = OUT / f"{slug}.jpg"
    img.save(out_flat, "JPEG", quality=92, optimize=True)

    folder = OUT / slug
    folder.mkdir(parents=True, exist_ok=True)
    img.save(folder / "main.jpg", "JPEG", quality=92, optimize=True)
    print(f"saved {out_flat.name} <- {path.name} ({COVERAGE:.0%} frame coverage)")


def export_from_staging_crop(slug: str, crop_filename: str, meta: dict[str, dict]) -> None:
    """Re-crop from original toroskt screenshot with margin, then contain-fit."""
    hash_prefix = hash_from_crop_filename(crop_filename)
    item = meta.get(hash_prefix)
    if not item:
        export_source(slug, STAGING / crop_filename, None)
        return

    source_path = SCREENSHOTS / item["source"]
    if not source_path.exists():
        export_source(slug, STAGING / crop_filename, None)
        return

    img = Image.open(source_path).convert("RGB")
    box = tuple(item["box"])
    expanded = expand_box(box, img.size, margin=0.12)
    export_source(slug, source_path, expanded)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    meta = load_staging_meta()

    chatgpt = ASSETS / "cleaned-png"
    mapping: list[tuple[str, Path, Optional[Tuple[int, int, int, int]]]] = [
        ("bos-deri", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_24_05 PM.png", None),
        ("bos-recurve-survivor", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_16_28 PM.png", None),
        ("bos-stag-frontier", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_27_03 PM.png", None),
        ("bos-stag-golden-horn", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_19_46 PM.png", None),
        ("bos-tera", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_32_17 PM.png", None),
        ("bos-zirve", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_25_53 PM.png", None),
        ("gur-mizrak", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_33_13 PM.png", None),
        ("gur-tombik", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_33_55 PM.png", None),
        ("gur-tuva", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_34_58 PM.png", None),
        ("misty-rebar-shank", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_36_00 PM.png", None),
        ("misty-stubby-giraffe", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_20_47 PM.png", None),
        ("toros-jellybean", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_18_04 PM.png", None),
        ("kam-ram", chatgpt / "ChatGPT Image Jun 14, 2026 at 09_18_56 PM.png", None),
    ]

    staging_slugs = [
        ("sakra-bear-claw-neck-knives", "crop_72_8ddc52e6.jpg"),
        ("toros-ceviz", "crop_65_21ac7af9.jpg"),
        ("toros-shepherd-knife", "crop_27_ee210e64.jpg"),
        ("toros-rhino", "crop_25_a84f4ba4.jpg"),
    ]

    # Ram horn: top half of dual-knife crop from original screenshot
    ram_item = meta.get("0205f128")
    if ram_item and (SCREENSHOTS / ram_item["source"]).exists():
        ram_src = Image.open(SCREENSHOTS / ram_item["source"]).convert("RGB")
        box = expand_box(tuple(ram_item["box"]), ram_src.size, margin=0.1)
        left, top, right, bottom = box
        mid = top + (bottom - top) // 2 + int((bottom - top) * 0.08)
        export_source("toros-ram-horn", SCREENSHOTS / ram_item["source"], (left, top, right, mid))
    else:
        export_from_staging_crop("toros-ram-horn", "crop_66_0205f128.jpg", meta)

    for slug, path, box in mapping:
        export_source(slug, path, box)

    for slug, crop_file in staging_slugs:
        export_from_staging_crop(slug, crop_file, meta)


if __name__ == "__main__":
    main()
