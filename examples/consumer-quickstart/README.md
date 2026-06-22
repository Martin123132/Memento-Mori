# Consumer Quickstart Smoke

This tiny project proves the first commands a real repo copies still work after installing Memento Mori Jester from npm.

```powershell
npm install --save-dev memento-mori-jester
npm run jester:doctor
npm run jester:summary
npm run jester:framework-tuning:check
npm run jester:framework-tuning:doctor
```

The package scripts map to the same public commands used by [Adoption Smoke CI](../ci/adoption-smoke.yml) at `examples/ci/adoption-smoke.yml`:

- `jester doctor`
- `jester summary --kind command "git reset --hard"`
- `npm run framework:tuning:check --prefix node_modules/memento-mori-jester`
- `npm run framework:tuning:doctor --prefix node_modules/memento-mori-jester`

Maintainers can run the checked version from the repo root:

```powershell
npm run consumer:quickstart:check
```

After publishing, the same checker can verify the public registry package:

```powershell
npm run consumer:quickstart:check -- --package memento-mori-jester@latest
```
