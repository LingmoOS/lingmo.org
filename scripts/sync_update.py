#!/usr/bin/env python3
# SPDX-FileCopyrightText: 2026 LingmoOS Contributors
# SPDX-License-Identifier: GPL-3.0-or-later
"""Update public/content/update.json, updates.json and releases.json.

The workflow is manual: the release version, build version and build code are
entered in the GitHub Actions form. ISO URLs are derived from mirror_base and
iso_pattern unless the release notes in public/content/releases/<build>/en.md
provide the text used for the summary and the release entry.
"""

import argparse
import difflib
import json
import re
import sys
from datetime import date
from pathlib import Path

ARCH_SUFFIX = {
    "x86_64": "amd64",
    "arm64": "arm64",
    "loongarch": "loongarch64",
}
CHANNELS = ("stable", "beta", "nightly")
BUILD_VERSION_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def fail(message):
    print(f"error: {message}", file=sys.stderr)
    raise SystemExit(2)


def load_json(path):
    try:
        with path.open(encoding="utf-8") as stream:
            return json.load(stream)
    except FileNotFoundError:
        fail(f"missing {path}")


def write_json(path, data, dry_run):
    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    old = path.read_text(encoding="utf-8")
    if dry_run:
        diff = difflib.unified_diff(
            old.splitlines(keepends=True),
            text.splitlines(keepends=True),
            fromfile=str(path),
            tofile=str(path),
        )
        sys.stdout.writelines(diff)
        return
    path.write_text(text, encoding="utf-8")


def md_to_html(markdown):
    """The subset of Markdown the site's mdToHtml() handles, for summary HTML."""
    html = markdown.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    html = re.sub(r"^### (.+)$", r"<h3>\1</h3>", html, flags=re.M)
    html = re.sub(r"^## (.+)$", r"<h2>\1</h2>", html, flags=re.M)
    html = re.sub(r"^# (.+)$", r"<h1>\1</h1>", html, flags=re.M)
    html = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', html)
    html = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", html)
    html = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", html)
    html = re.sub(r"^- (.+)$", r"<li>\1</li>", html, flags=re.M)
    html = re.sub(r"^\d+\. (.+)$", r"<li>\1</li>", html, flags=re.M)
    html = re.sub(
        r"(?:<li>.*?</li>\n?)+",
        lambda match: "<ul>" + match.group(0).strip() + "</ul>",
        html,
        flags=re.S,
    )
    blocks = re.split(r"\n{2,}", html)
    rendered = []
    for block in blocks:
        text = block.strip()
        if not text:
            continue
        if re.match(r"^<[hul]", text) or re.match(r"^</[ul]", text):
            rendered.append(text)
        else:
            rendered.append(f"<p>{text}</p>")
    return "\n".join(rendered)


def parse_args(argv):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=str(Path(__file__).resolve().parent.parent))
    parser.add_argument("--channel", required=True, choices=CHANNELS)
    parser.add_argument("--version", required=True, help="release version, e.g. 5.0")
    parser.add_argument("--build-version", required=True, help="build version, e.g. 26a17")
    parser.add_argument("--build-time", required=True, help="BUILD_TIME from os-release, e.g. 26118183")
    parser.add_argument("--release-date", default="", help="YYYY-MM-DD; empty uses today")
    parser.add_argument("--codename", default="")
    parser.add_argument("--title", default="")
    parser.add_argument("--release-notes-url", default="")
    parser.add_argument("--summary", default="", help="HTML summary for update.json at --notes-locale")
    parser.add_argument("--changelog", default="", help="Markdown for releases.json")
    parser.add_argument("--notes-locale", default="en")
    parser.add_argument("--architectures", default="x86_64,arm64")
    parser.add_argument("--mirror-base", default="https://mirrors.lingmo.org/releases")
    parser.add_argument(
        "--iso-pattern",
        default="lingmo-os-{version}-{build}-desktop-{arch}.iso",
        help="filename pattern with {version}, {build} and {arch}",
    )
    parser.add_argument("--mandatory", action="store_true")
    parser.add_argument("--security", action="store_true")
    parser.add_argument("--critical", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args(argv)


def validate(args):
    if not BUILD_VERSION_RE.fullmatch(args.build_version) or ".." in args.build_version:
        fail("invalid build version")
    if not BUILD_VERSION_RE.fullmatch(args.version):
        fail("invalid release version")
    if not args.build_time.isdigit():
        fail("BUILD_TIME must be numeric")
    if args.release_date and not DATE_RE.fullmatch(args.release_date):
        fail("release date must be YYYY-MM-DD")
    if not args.architectures.strip():
        fail("at least one architecture is required")
    for arch in args.architectures.split(","):
        if arch.strip() not in ARCH_SUFFIX:
            fail(f"unknown architecture {arch.strip()!r}")


def main(argv=None):
    args = parse_args(argv)
    validate(args)

    root = Path(args.root).resolve()
    updates_path = root / "public/content/updates.json"
    update_path = root / "public/content/update.json"
    releases_path = root / "public/content/releases.json"

    release_date = args.release_date or date.today().isoformat()
    title = args.title or f"Lingmo OS {args.version} {args.build_version}"
    if args.codename:
        title += f" ({args.codename})"
    nightly = args.channel == "nightly"
    notes_url = args.release_notes_url or ("/releases/nightly" if nightly
                                           else f"/releases/{args.build_version}")

    architectures = [arch.strip() for arch in args.architectures.split(",") if arch.strip()]
    iso_pattern = args.iso_pattern
    if nightly and iso_pattern == "lingmo-os-{version}-{build}-desktop-{arch}.iso":
        iso_pattern = "lingmo-os-nightly-{arch}.iso"
    path_segment = "nightly" if nightly else args.build_version
    downloads = {}
    for arch in architectures:
        filename = iso_pattern.format(
            version=args.version, build=args.build_version, arch=ARCH_SUFFIX[arch]
        )
        iso = f"{args.mirror_base.rstrip('/')}/{path_segment}/{filename}"
        downloads[arch] = {"iso": iso, "checksum": iso + ".sha256"}

    notes_dir = root / "public/content/releases" / args.build_version
    notes_by_locale = {}
    if notes_dir.is_dir():
        for path in sorted(notes_dir.glob("*.md")):
            notes_by_locale[path.stem] = path.read_text(encoding="utf-8")
    notes = notes_by_locale.get(args.notes_locale, "")

    updates = load_json(updates_path)
    update = load_json(update_path)
    releases = load_json(releases_path)

    existing_release = next(
        (entry for entry in releases if entry.get("version") == args.build_version), None
    )
    previous_latest = update["channels"].get(args.channel, {}).get("latest", {})
    summary_map = {}
    if previous_latest.get("buildVersion") == args.build_version:
        previous_summary = previous_latest.get("summary")
        if isinstance(previous_summary, dict):
            summary_map.update({str(k): str(v) for k, v in previous_summary.items() if v})
        elif isinstance(previous_summary, str) and previous_summary:
            summary_map["en"] = previous_summary
    for locale, markdown in notes_by_locale.items():
        summary_map[locale] = md_to_html(markdown)
    if args.summary:
        summary_map[args.notes_locale] = args.summary
    if not summary_map:
        if existing_release and existing_release.get("content"):
            summary_map["en"] = md_to_html(existing_release["content"])
        else:
            summary_map["en"] = f"<h2>{title}</h2><p>Release date: {release_date}</p>"

    if args.changelog:
        changelog = args.changelog
    elif notes:
        changelog = notes
    elif existing_release:
        changelog = existing_release.get("content", "")
    else:
        changelog = f"## {title}\n\nReleased on {release_date}.\n"

    updates["channels"][args.channel] = {
        "version": args.build_version,
        "build": int(args.build_time),
        "mandatory": args.mandatory,
        "releaseNotes": notes_url,
        "architectures": {
            arch: {"iso": data["iso"], "sha256": data["checksum"]}
            for arch, data in downloads.items()
        },
    }

    update["channels"][args.channel] = {
        "latest": {
            "version": args.version,
            "buildVersion": args.build_version,
            "buildCode": int(args.build_time),
            "releaseDate": release_date,
            "security": args.security,
            "critical": args.critical,
            "mandatory": args.mandatory,
            "releaseNotesUrl": notes_url,
            "summary": summary_map,
            "download": downloads,
        }
    }

    release = {
        "version": args.build_version,
        "date": release_date,
        "title": title,
        "content": changelog,
        "type": args.channel,
    }
    if existing_release:
        existing_release.update(release)
    else:
        releases.insert(0, release)

    write_json(updates_path, updates, args.dry_run)
    write_json(update_path, update, args.dry_run)
    write_json(releases_path, releases, args.dry_run)

    if not args.dry_run:
        print(
            f"updated {args.channel}: {args.version} / {args.build_version} / "
            f"{args.build_time} ({release_date})"
        )


if __name__ == "__main__":
    main()
