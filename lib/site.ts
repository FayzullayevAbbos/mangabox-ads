// Public origin of the marketing site, used for canonical URLs, sitemap,
// robots and Open Graph absolute URLs. Override per environment.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://volar.uz"
).replace(/\/$/, "");
