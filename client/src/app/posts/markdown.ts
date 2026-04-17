import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: false
});

// Inline image convention for local posts:
//   ![alt](media/{slug}/filename.ext)
// Files live at client/src/assets/blog/media/{slug}/filename.ext and are served
// from assets/blog/media/{slug}/filename.ext. Absolute URLs (http, https, //, /,
// data:) are passed through untouched.
marked.use({
  renderer: {
    image({ href, title, text }: { href: string; title: string | null; text: string }): string {
      const isAbsolute =
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('//') ||
        href.startsWith('/') ||
        href.startsWith('data:');
      const resolvedSrc = isAbsolute ? href : `assets/blog/${href}`;
      const safeAlt = text.replace(/"/g, '&quot;');
      const titleAttr =
        title && title.length > 0 ? ` title="${title.replace(/"/g, '&quot;')}"` : '';
      return `<img src="${resolvedSrc}" alt="${safeAlt}"${titleAttr} />`;
    }
  }
});

export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false });
}
