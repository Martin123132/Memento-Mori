# Demo Script

Use this when showing someone what the project does.

## 1. Health Check

```powershell
npx -y memento-mori-jester@latest doctor
```

Expected result: `PASS` checks and a final line saying the tool is fit for use.

## 2. Dangerous Command Review

```powershell
npx -y memento-mori-jester@latest command "git reset --hard"
```

Expected result: `BLOCK`.

## 3. Overconfident Plan Review

```powershell
npx -y memento-mori-jester@latest plan "I will just refactor auth and ship it"
```

Expected result: usually `CAUTION`, because the plan touches a sensitive area and has no verification step.

## 4. Bootstrap A Fresh Folder

```powershell
mkdir jester-demo
cd jester-demo
npx -y memento-mori-jester@latest bootstrap --preset node
```

Expected files:

- `jester.config.json`
- `memento-mori.mcp.json`
- `MEMENTO_MORI.md`

## 5. Validate The Config

```powershell
npx -y memento-mori-jester@latest config validate
```

Expected result: `Config valid`.
