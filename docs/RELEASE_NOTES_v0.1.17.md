# v0.1.17 Release Notes

This release adds two stack-specific presets so teams can get useful project rules without hand-writing regex config first.

## Added

- `web` preset for frontend and browser app repos.
- `infra` preset for deployment, cloud, container, and infrastructure repos.
- Tests proving both presets build on the default config, write valid config files, and appear in the CLI preset list.

## Web Preset

- Flags client-exposed secret-like environment variable names such as `NEXT_PUBLIC_*`, `VITE_*`, and `PUBLIC_*`.
- Flags `dangerouslySetInnerHTML` and direct `innerHTML` changes.
- Flags sensitive values being written to `localStorage` or `sessionStorage`.
- Flags open-redirect-shaped changes using URL or request parameters.

## Infra Preset

- Sets `riskTolerance` to `low` and `hookFailOn` to `caution`.
- Blocks commands such as `terraform destroy`, `kubectl delete`, `helm uninstall`, and `docker system prune -a`.
- Flags production-impacting Terraform, Pulumi, Kubernetes, and Helm commands.
- Flags IAM wildcard permissions, public cloud exposure, and infrastructure state or secret material.

## Useful Commands

```powershell
npx -y memento-mori-jester@latest config init --preset web
npx -y memento-mori-jester@latest config init --preset infra
npx -y memento-mori-jester@latest bootstrap --preset web
npx -y memento-mori-jester@latest bootstrap --preset infra
npx -y memento-mori-jester@latest config presets
```
