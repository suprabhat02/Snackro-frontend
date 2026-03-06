/**
 * Image Registry — single source of truth for all app images.
 *
 * ─── Two categories ────────────────────────────────────────────────────────
 *
 * 1. PUBLIC ASSETS  (apps/web/public/assets/images/)
 *    Vite does NOT process these. They are served as static files at the URL
 *    path that mirrors their location under public/.
 *    → Exported here as typed URL string constants.
 *    → Use for: og-image, manifest icons, anything that needs a stable URL.
 *
 * 2. BUNDLED ASSETS  (apps/web/src/assets/images/)
 *    Imported with a normal ES `import` statement. Vite processes them:
 *    returns a content-hashed URL, handles tree-shaking, and enforces
 *    module-level type safety via the declarations in vite-env.d.ts.
 *    → Use for: images only consumed inside the React app.
 *
 * ─── Adding a new image ────────────────────────────────────────────────────
 *
 * Public (large / externally-referenced):
 *   1. Drop the file into apps/web/public/assets/images/
 *   2. Add an entry to PUBLIC_IMAGES below.
 *
 * Bundled (app-only, benefits from content hashing):
 *   1. Drop the file into apps/web/src/assets/images/ (next to this file).
 *   2. Add:  import myImage from "./my-image.png";
 *   3. Add the key to BUNDLED_IMAGES below.
 *
 * In both cases the image is available through the unified `images` export.
 * ───────────────────────────────────────────────────────────────────────────
 */

// ─── 1. Public assets ──────────────────────────────────────────────────────
// Files live in apps/web/public/assets/images/ and are served as-is.

const PUBLIC_IMAGES = {
  snackroLogo: "/assets/images/snackro-logo.png",
} as const satisfies Record<string, `/${string}`>;

// ─── 2. Bundled assets ─────────────────────────────────────────────────────
// Add import statements here as you bring images into src/assets/images/.
// Example:
//   import snackroLogoBundled from "./snackro-logo.png";
//   const BUNDLED_IMAGES = { snackroLogoBundled } as const;

const BUNDLED_IMAGES = {} as const;

// ─── Unified export ────────────────────────────────────────────────────────

export const images = {
  ...PUBLIC_IMAGES,
  ...BUNDLED_IMAGES,
} as const;

/** All valid image keys in the registry. */
export type ImageKey = keyof typeof images;

/** Any image src value from the registry. */
export type ImageSrc = (typeof images)[ImageKey];
