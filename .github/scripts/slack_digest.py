"""Post the day's headline findings to Slack.

Called by .github/workflows/refresh-data.yml after a collection run. Lives in a
file rather than inline in the workflow because a heredoc inside a YAML block
scalar is fragile — the terminator has to sit at column 0, which breaks the
block's indentation.

Usage:
    slack_digest.py <date> <gaps.json> <alerts.json> <webhook-url>

Exits 0 even when there is nothing to report: a quiet day is a valid result, and
the workflow should not fail over it.
"""

import json
import sys
import urllib.request

DASHBOARD = "https://myntra-trend-pulse.lovable.app/"


def read(path):
    try:
        with open(path, encoding="utf-8") as handle:
            data = json.load(handle)
        return data if isinstance(data, list) else []
    except (OSError, json.JSONDecodeError) as err:
        print(f"could not read {path}: {err}")
        return []


def format_gaps(rows):
    if not rows:
        return "Nothing undercutting us on a matched product today."

    lines = []
    for row in rows:
        name = str(row.get("own_product_name", "unknown"))[:60]
        gap = abs(float(row.get("price_gap") or 0))
        lines.append(
            f"• {name} — {row.get('competitor')} "
            f"₹{row.get('competitor_price')} vs ours ₹{row.get('own_price')} "
            f"(₹{gap:.0f} cheaper)"
        )
    return "\n".join(lines)


def format_alerts(rows):
    if not rows:
        return "No new critical alerts today."
    return "\n".join("• " + str(r.get("title", ""))[:80] for r in rows)


def main():
    if len(sys.argv) != 5:
        print(__doc__)
        return 1

    day, gaps_path, alerts_path, webhook = sys.argv[1:5]

    text = (
        f"*TrendPulse — {day} digest*\n\n"
        f"*Where a competitor is undercutting us*\n{format_gaps(read(gaps_path))}\n\n"
        f"*New critical alerts*\n{format_alerts(read(alerts_path))}\n\n"
        f"<{DASHBOARD}|Open the dashboard>"
    )

    request = urllib.request.Request(
        webhook,
        data=json.dumps({"text": text}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            print("slack responded:", response.status)
    except Exception as err:  # noqa: BLE001 - a failed digest must not fail the run
        print("could not post the digest:", err)
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(main())
