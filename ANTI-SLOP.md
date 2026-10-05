# Anti-slop checks

Run `npm ci --ignore-scripts` and `npm run lint` with Node 24 or newer.
GitHub Actions runs the same check.

Oxlint cannot parse HTML directly. `tools/lint-inline.mjs` uses the HTML parser
parse5 to extract inline JavaScript from `index.html` into temporary files.
It keeps HTML line numbers in diagnostics, propagates lint failures, and
removes the files afterward. The browser page is not modified.
External scripts are not fetched or checked. JSON and other non-JavaScript
script blocks are not linted. Ordinary project JavaScript is also checked.

All 18 generic upstream rules and `oxc/no-accumulating-spread` are errors.
Built-in correctness rules are disabled in this focused additional check.
Vendored rules, dependencies, and agent tooling are excluded. Effect rules
do not apply. There is no TypeScript project or existing typecheck command.

See `tools/oxlint/anti-slop/UPSTREAM.md` for the exact upstream revision and
licenses. Existing findings remain enabled and need a separate cleanup.
