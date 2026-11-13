# Working rules

## Fixing review findings and failing CI

A review finding or a CI failure is a symptom. Before pushing a fix:

1. Find the root cause, and the whole class of problem it belongs to (for example "a path is checked before it is used", not just the line that was flagged).
2. Read the entire affected file or function, not only the flagged lines, and look for the same class of mistake and its neighbours: symbolic links, check-then-use races, relative paths and the working directory, ordering of checks against side effects, empty and missing input, other platforms.
3. Add a test for every case found, including the ones nobody flagged. A new test must fail without the fix.
4. Run the full test suite, then push once with everything fixed. Do not push a fix to see whether the reviewer or CI accepts it.
5. A fix is not done until CI is green and no review thread is open. Do not dismiss a code scanning alert or resolve a security finding to get there.

Never merge a pull request until it is up to date with `main`, CI is green and no review has open findings. One pull request at a time.
