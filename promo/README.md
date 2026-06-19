# Memento Mori Jester Promo Kit

This folder contains repo-local marketing assets for sharing Memento Mori Jester. It is intentionally outside the npm package, so the published CLI stays small.

## Use First

- Final vertical demo video: [x-demo-v0.1.78/renders/memento-mori-jester-x-demo-v0.1.78.mp4](x-demo-v0.1.78/renders/memento-mori-jester-x-demo-v0.1.78.mp4)
- Share kit: [share-kit](share-kit)
- Recommended still for X: [share-kit/stills/04-try-it.jpg](share-kit/stills/04-try-it.jpg)
- Short demo script: [share-kit/demo-script.md](share-kit/demo-script.md)
- X post copy: [share-kit/x-posts.md](share-kit/x-posts.md)

## Quick Sharing Checklist

1. Pick the short or medium X post from [share-kit/x-posts.md](share-kit/x-posts.md).
2. Attach the demo video, or use [share-kit/stills/04-try-it.jpg](share-kit/stills/04-try-it.jpg) if posting an image.
3. Include the install command:

   ```text
   npx -y memento-mori-jester@latest start
   ```

4. Link to the repo:

   ```text
   https://github.com/Martin123132/Memento-Mori
   ```

5. If someone asks what it does, send them the 30-second script in [share-kit/demo-script.md](share-kit/demo-script.md).

## Asset Notes

- Use `x-demo-v0.1.78` for current promo posts.
- `x-demo-v0.1.70` is kept as the original archived render.
- Use `@latest` in public copy so the command always points at the newest npm release.
- Run `npm run promo:check` from the repo root after editing promo assets or fixture numbers.
- Run `npm run promo:check -- --require-package-version` only after intentionally refreshing the demo to the current package version.
- Do not add `promo/` to `package.json` `files`; these assets are for GitHub and social sharing, not npm distribution.
