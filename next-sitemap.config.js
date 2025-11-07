/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://votre-site.netlify.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  outDir: './public',
}
