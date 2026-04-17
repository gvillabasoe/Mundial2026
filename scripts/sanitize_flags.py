#!/usr/bin/env python3
"""Regenera banderas seguras para Vercel/GitHub.

Uso:
  python scripts/sanitize_flags.py /ruta/a/Banderaszip /ruta/salida/public/flags /ruta/lib/flag-manifest.ts
"""

from __future__ import annotations

import json
import re
import shutil
import sys
import unicodedata
from pathlib import Path

SOURCE_TO_CANONICAL = {
    "Corea": "Corea del Sur",
    "Holanda": "Países Bajos",
    "USA": "Estados Unidos",
    "Costa Marfil": "Costa de Marfil",
    "Qatar": "Catar",
    "Iraq": "Irak",
    "Turquia": "Turquía",
    "República Checa": "Chequia",
    "Haiti": "Haití",
}

ALIASES = {
    "paises_bajos": ["paises_bajos", "holanda"],
    "estados_unidos": ["estados_unidos", "usa", "eeuu", "us"],
    "arabia_saudi": ["arabia_saudi", "arabia_saudita"],
    "rd_del_congo": ["rd_del_congo", "rd_congo", "republica_democratica_del_congo"],
    "bosnia_y_herzegovina": ["bosnia_y_herzegovina", "bosnia_herzegovina"],
    "corea_del_sur": ["corea_del_sur", "corea_sur", "corea"],
    "republica_checa": ["republica_checa", "chequia"],
}
REVERSE_ALIASES = {alias: canonical for canonical, aliases in ALIASES.items() for alias in aliases}


def decode_name(name: str) -> str:
    return re.sub(r"#U([0-9A-Fa-f]{4})", lambda m: chr(int(m.group(1), 16)), name)


def normalize_team_key(name: str) -> str:
    key = name.lower().strip()
    key = unicodedata.normalize("NFD", key)
    key = "".join(ch for ch in key if unicodedata.category(ch) != "Mn")
    key = key.replace("ñ", "n")
    key = re.sub(r"[''´`\".,:;!?()\[\]{}]", "", key)
    key = re.sub(r"[\s\-/\\]+", "_", key)
    key = re.sub(r"_+", "_", key).strip("_")
    return REVERSE_ALIASES.get(key, key)


def main() -> int:
    if len(sys.argv) != 4:
        print(__doc__)
        return 1

    source_dir = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    manifest_path = Path(sys.argv[3])

    out_dir.mkdir(parents=True, exist_ok=True)
    for png in out_dir.glob("*.png"):
        png.unlink()

    created = []
    for file_path in sorted(source_dir.glob("*.png")):
        decoded = decode_name(file_path.stem)
        canonical = SOURCE_TO_CANONICAL.get(decoded, decoded)
        key = normalize_team_key(canonical)
        shutil.copyfile(file_path, out_dir / f"{key}.png")
        created.append({
            "source": file_path.name,
            "decoded": decoded,
            "canonical": canonical,
            "key": key,
        })

    keys = sorted({row["key"] for row in created})
    manifest_path.write_text(
        "// Auto-generated safe flag manifest\n"
        "export const AVAILABLE_FLAG_KEYS = new Set<string>([\n"
        + "".join(f"  '{key}',\n" for key in keys)
        + "]);\n",
        encoding="utf-8",
    )

    report_path = manifest_path.parent.parent / "scripts" / "flag-sanitize-report.json"
    report_path.write_text(json.dumps(created, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated {len(keys)} safe flags")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
