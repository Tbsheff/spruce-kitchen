#!/usr/bin/env python3
"""
Color-match a generated food image so its background matches the site's
Isabelline cream. Pure Pillow, uniform RGB shift.

Strategy (v5, non-destructive):
  1. Sample top 5% brightest bg-classified pixels for "intended cream"
  2. Compute per-channel RGB delta to target
  3. Apply uniform delta to every pixel (clipped to [0, 255])

Target: rgb(249, 245, 240) — browser-rendered value of hsl(30, 44%, 96%)
from globals.css `--brand-isabelline`. NOT #FAF6F2/(250,246,242).

Usage:
    python3 scripts/color-match.py <input.png> [output.png]
"""

from __future__ import annotations

import colorsys
import sys
from pathlib import Path

from PIL import Image

TARGET_RGB = (249, 245, 240)
BG_V_MIN = 0.85
BG_S_MAX = 0.15


def is_bg_like(r: int, g: int, b: int) -> bool:
    _, s, v = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
    return v > BG_V_MIN and s < BG_S_MAX


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    in_path = Path(sys.argv[1])
    if not in_path.exists():
        print(f"error: {in_path} not found")
        return 1
    out_path = (
        Path(sys.argv[2])
        if len(sys.argv) >= 3
        else in_path.with_name(f"{in_path.stem}-corrected{in_path.suffix}")
    )

    img = Image.open(in_path).convert("RGB")
    w, h = img.size
    pixels = img.load()
    print(f"Source: {in_path.name}  ({w}×{h})")

    bg_samples = []
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            if is_bg_like(r, g, b):
                bg_samples.append((r, g, b))
    if len(bg_samples) < 100:
        print("error: not enough bg-like pixels")
        return 1

    bg_samples.sort(key=lambda p: 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2], reverse=True)
    top = bg_samples[: max(1, len(bg_samples) // 20)]
    ir = sum(p[0] for p in top) / len(top)
    ig = sum(p[1] for p in top) / len(top)
    ib = sum(p[2] for p in top) / len(top)
    print(f"Intended cream: rgb({ir:.1f}, {ig:.1f}, {ib:.1f})")
    print(f"Target cream:   rgb{TARGET_RGB}")

    dr, dg, db = TARGET_RGB[0] - ir, TARGET_RGB[1] - ig, TARGET_RGB[2] - ib
    print(f"Uniform shift: R{dr:+.2f} G{dg:+.2f} B{db:+.2f}")

    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                max(0, min(255, int(r + dr + 0.5))),
                max(0, min(255, int(g + dg + 0.5))),
                max(0, min(255, int(b + db + 0.5))),
            )

    img.save(out_path, optimize=True)
    print(f"Saved: {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
