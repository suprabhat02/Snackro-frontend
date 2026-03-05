# Static Assets

This directory is served at the root URL in production by Vite.

## Logo

Place the SNACKRO logo at:

```
apps/web/public/assets/images/snackro-logo.png
```

It will be accessible at `/assets/images/snackro-logo.png` and is referenced by:

- [`SnackroLogo`](../../src/components/SnackroLogo.tsx) — used on LoginPage, CompleteProfilePage, and DashboardPage header.

The component shows a styled letter-mark fallback (`S`) if the image has not been placed here yet.

## Recommended formats

| Use case     | Format  | Notes                                  |
| ------------ | ------- | -------------------------------------- |
| Logo primary | `.png`  | Transparent background, min 256×256 px |
| Logo SVG     | `.svg`  | Scalable, prefer for code embedding    |
| Other images | `.webp` | Best compression for photos            |
