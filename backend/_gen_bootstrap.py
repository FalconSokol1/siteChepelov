import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
TARGETS = [
    "kavkazkamen/settings.py",
    "api/__init__.py",
    "api/apps.py",
    "api/admin.py",
    "api/models.py",
    "api/serializers.py",
    "api/views.py",
    "api/urls.py",
    "api/management/__init__.py",
    "api/management/commands/__init__.py",
    "api/management/commands/seed_data.py",
]

files = {}
for rel in TARGETS:
    p = ROOT / rel
    raw = p.read_bytes()
    if raw.startswith(b"\xff\xfe"):
        text = raw.decode("utf-16")
    elif len(raw) > 1 and raw[1] == 0:
        text = raw.decode("utf-16-le")
    else:
        text = raw.decode("utf-8")
    if rel == "api/management/commands/seed_data.py":
        text = text.replace(" ?", " \u20bd")
    files[rel] = text

header = '''#!/usr/bin/env python3
"""Write KavkazKamen Django backend files as UTF-8."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent

FILES = {
'''
body_parts = [header]
for rel, content in files.items():
    body_parts.append(f"    {rel!r}: {content!r},\n")
body_parts.append("}\n\n\n")
body_parts.append(
    """def main() -> None:
    for rel, content in FILES.items():
        path = ROOT / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding=\"utf-8\")
        print(f\"Wrote {rel}\")


if __name__ == \"__main__\":
    main()
"""
)
(ROOT / "bootstrap_backend.py").write_text("".join(body_parts), encoding="utf-8")
print("Created bootstrap_backend.py with", len(files), "files")
