# v0.1.10 Release Notes

This release makes Memento Mori Jester easier to plug into CI and code-scanning workflows with SARIF output.

## Added

- `--sarif` output for `plan`, `command`, `diff`, and `final` reviews.
- SARIF 2.1.0 result formatting with rule ids, severity levels, risk scores, evidence, and suggested checks.
- GitHub Action `format: sarif` and `output-file` inputs for writing review results to a file.
- CLI and GitHub Actions docs for generating `jester.sarif`.

## Useful Commands

```powershell
npx -y memento-mori-jester@latest command "git reset --hard" --sarif
git diff | npx -y memento-mori-jester@latest diff --sarif > jester.sarif
git diff | npx -y memento-mori-jester@latest diff --sarif --fail-on block > jester.sarif
```
