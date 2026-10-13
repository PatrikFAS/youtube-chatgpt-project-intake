#!/usr/bin/env python3
"""Build a deterministic ZIP from the committed extension source tree."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path, PurePosixPath
import subprocess
import sys
import tempfile
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


DOCS = ("README.md", "LICENSE", "NOTICE.md", "CHANGELOG.md", "TESTING.md")
EXCLUDED = {".gitignore", "AGENTS.md", "package.json"}
EXCLUDED_PREFIXES = ("scripts/", "tests/")
ZIP_TIME = (1980, 1, 1, 0, 0, 0)


def git(root: Path, *args: str, check: bool = True) -> bytes:
    result = subprocess.run(
        ["git", *args], cwd=root, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, check=False,
    )
    if check and result.returncode:
        message = result.stderr.decode("utf-8", "replace").strip()
        raise RuntimeError(message or f"git {' '.join(args)} failed")
    return result.stdout


def committed_files(root: Path) -> dict[str, bytes]:
    status = git(root, "status", "--porcelain", "--untracked-files=no").decode().strip()
    if status:
        raise RuntimeError("Tracked working tree is not clean. Commit or discard tracked changes before packaging.")

    records = git(root, "ls-tree", "-r", "-z", "--full-tree", "HEAD").split(b"\0")
    files: dict[str, bytes] = {}
    for record in records:
        if not record:
            continue
        metadata, raw_path = record.split(b"\t", 1)
        mode, kind, object_id = metadata.decode("ascii").split()
        path = raw_path.decode("utf-8")
        if kind != "blob" or mode not in {"100644", "100755"}:
            raise RuntimeError(f"Unsupported committed file type: {path}")
        if path in EXCLUDED or path.startswith(EXCLUDED_PREFIXES):
            continue
        files[path] = git(root, "cat-file", "blob", object_id)

    missing_docs = [name for name in DOCS if name not in files]
    if missing_docs:
        raise RuntimeError("Required committed package documentation is missing: " + ", ".join(missing_docs))

    return files


def manifest_references(manifest: dict) -> set[str]:
    refs: set[str] = set()
    refs.add(manifest.get("background", {}).get("service_worker"))
    refs.add(manifest.get("action", {}).get("default_popup"))
    refs.add(manifest.get("options_page"))
    refs.update(manifest.get("icons", {}).values())
    refs.update(manifest.get("action", {}).get("default_icon", {}).values())
    for group in manifest.get("content_scripts", []):
        refs.update(group.get("js", []))
        refs.update(group.get("css", []))
    for group in manifest.get("web_accessible_resources", []):
        refs.update(group.get("resources", []))
    return {ref for ref in refs if ref}


def make_archive(output: Path) -> None:
    root = Path(__file__).resolve().parent.parent
    try:
        manifest = json.loads(git(root, "show", "HEAD:manifest.json"))
        package = json.loads(git(root, "show", "HEAD:package.json"))
    except (json.JSONDecodeError, KeyError) as error:
        raise RuntimeError(f"Could not read committed package metadata: {error}") from error

    version = manifest.get("version")
    package_version = package.get("version")
    if not isinstance(version, str) or not version:
        raise RuntimeError("Committed manifest.json has no version.")
    if version != package_version:
        raise RuntimeError(f"Version mismatch: manifest.json is {version}, package.json is {package_version}.")

    files = committed_files(root)
    missing_runtime = sorted(manifest_references(manifest) - files.keys())
    if missing_runtime:
        raise RuntimeError("Committed manifest references files omitted from the package: " + ", ".join(missing_runtime))
    if "manifest.json" not in files:
        raise RuntimeError("Committed manifest.json is missing from the package.")

    root = root.resolve()
    output = output.expanduser().resolve()
    if os.path.commonpath((str(root), str(output))) == str(root):
        raise RuntimeError("Choose an output path outside the repository.")
    output.parent.mkdir(parents=True, exist_ok=True)

    commit = git(root, "rev-parse", "HEAD").decode().strip()
    files["BUILD.txt"] = f"version={version}\ncommit={commit}\n".encode()

    temp_fd, temp_name = tempfile.mkstemp(prefix=f".{output.name}.", suffix=".tmp", dir=output.parent)
    os.close(temp_fd)
    try:
        with ZipFile(temp_name, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
            for name in sorted(files):
                info = ZipInfo(str(PurePosixPath(name)), date_time=ZIP_TIME)
                info.compress_type = ZIP_DEFLATED
                info.create_system = 3
                info.external_attr = 0o100644 << 16
                archive.writestr(info, files[name], compress_type=ZIP_DEFLATED, compresslevel=9)
        os.replace(temp_name, output)
    finally:
        if os.path.exists(temp_name):
            os.unlink(temp_name)

    print(f"Created {output} (v{version}, commit {commit[:12]}, {len(files)} files)")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create a deterministic versioned ZIP from the clean committed extension tree."
    )
    parser.add_argument("output", type=Path, help="ZIP output path outside the repository")
    args = parser.parse_args()
    try:
        make_archive(args.output)
    except (OSError, RuntimeError, subprocess.SubprocessError) as error:
        print(f"package failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
