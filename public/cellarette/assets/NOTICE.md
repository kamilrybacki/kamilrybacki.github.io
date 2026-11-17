# Fonts

- Space Grotesk, Copyright 2020 The Space Grotesk Project Authors. SIL Open Font License 1.1 (OFL-SpaceGrotesk.txt).
- Space Mono, Copyright 2016 The Space Mono Project Authors. SIL Open Font License 1.1 (OFL-SpaceMono.txt).

Files are static instances (400/500/700 and 400/700), latin + latin-ext subsets from Fontsource
(fetched 2026-10-30). Polish diacritics live in latin-ext, so both subsets must be declared with
their unicode-range or ą/ę/ł/ż fall back to a system font.
- DejaVu Sans Mono (subset: printable ASCII U+0020–007E + block/card glyphs for the ASCII renders), Bitstream Vera / DejaVu public licence, from the system package (/usr/share/fonts/truetype/dejavu). Subset built with pyftsubset into dejavu-sans-mono-ascii-art.woff2.
