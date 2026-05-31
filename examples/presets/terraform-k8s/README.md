# Terraform Kubernetes Example

Use this shape for repos that manage Terraform, Kubernetes manifests, Helm charts, cloud IAM, or deployment state.

Recommended built-in preset:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset infra
```

Useful checks:

```powershell
npx -y memento-mori-jester@latest config recommend
git diff | npx -y memento-mori-jester@latest diff --fail-on block --subject "Terraform Kubernetes diff"
git diff | npx -y memento-mori-jester@latest summary
```
