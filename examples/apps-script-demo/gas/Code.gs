/**
 * Serves the self-contained demo page (demo.html, built by `npm run build`).
 *
 * The page embeds its script, styles, font and data and makes no network
 * request. It declares <base target="_top"> so that any link opens in the top
 * window instead of the sandboxed frame. Apps Script drops <meta> tags found in
 * the file, so the viewport is declared here. The title is the same as the
 * <title> of demo.html (scripts/build.ts). The third-party notices of what the
 * page embeds are the comment at the top of demo.html.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('demo')
    .setTitle('Design system demo — decision dossier')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
