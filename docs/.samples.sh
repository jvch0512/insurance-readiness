node dist/src/cli.js check examples/renewal-draft.json > /tmp/a.md || true; diff /tmp/a.md docs/sample-draft.md
node dist/src/cli.js check examples/ready.json > /tmp/b.md; diff /tmp/b.md docs/sample-ready.md
test "$(node dist/src/cli.js check examples/renewal-draft.json >/dev/null; echo $?)" = "1"
node dist/src/cli.js check examples/ready.json >/dev/null
