#!/bin/sh
# Regenerate the `updatedAtMap` in src/data/docs.ts.
#
# Source of truth is the **GitHub API**, not local git: the map describes when
# each doc was last edited in the *published* repo, so a stale local clone or
# an unpushed branch can't skew it. Uses the committer date of the most recent
# commit touching each content file:
#
#   GET /repos/{owner}/{repo}/commits?path=content/<slug>.mdx&per_page=1
#
# Run this after editing any file in content/, then commit the map alongside the
# doc changes. Note the map only reflects commits that are already pushed —
# after merging this change, re-run once to pick up your own commit's date.
#
# Set GITHUB_TOKEN to avoid the anonymous rate limit (60 req/h per IP).
set -eu
cd "$(dirname "$0")/.."

REPO=${GTM_DOCS_REPO:-prjctimg/gtm.docs}
API="https://api.github.com/repos/$REPO/commits"

auth=""
if [ -n "${GITHUB_TOKEN:-}" ]; then
  auth="Authorization: Bearer $GITHUB_TOKEN"
fi

tmp=$(mktemp)
{
  echo "// Map of content file names → ISO-8601 last-updated timestamp."
  echo "// Source: GitHub API — committer date of the latest commit touching"
  echo "// each file, i.e. \`GET /repos/$REPO/commits?path=content/<slug>.mdx\`."
  echo "// Regenerate with scripts/regen-updated-at.sh after editing any doc."
  echo "const updatedAtMap: Record<string, string> = {"
  for f in content/*.mdx; do
    b=$(basename "$f" .mdx)
    date=$(curl -sS -m 20 -H "Accept: application/vnd.github+json" ${auth:+-H "$auth"} \
      "$API?path=content/$b.mdx&per_page=1" |
      python3 -c "import json,sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
print(d[0]['commit']['committer']['date'] if d else '')")
    if [ -z "$date" ]; then
      echo "warning: no commit found for content/$b.mdx — leaving it out" >&2
      continue
    fi
    case "$b" in
      *-*) key="'$b'" ;;
      *)   key="$b" ;;
    esac
    printf "  %-18s '%s',\n" "$key:" "$date"
  done
  echo "};"
} > "$tmp"

# Splice the generated block over the existing literal, leaving the rest of the
# file untouched.
awk -v repl="$tmp" '
  /^\/\/ Map of content file names/ { skipping = 1; while ((getline line < repl) > 0) print line; next }
  skipping && /^};$/ { skipping = 0; next }
  skipping { next }
  { print }
' src/data/docs.ts > src/data/docs.ts.new

mv src/data/docs.ts.new src/data/docs.ts
rm -f "$tmp"
echo "updated updatedAtMap for $(ls content/*.mdx | wc -l) docs from $REPO"
