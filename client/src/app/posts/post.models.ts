/** Manifest at assets/blog/posts.json — add entries here when publishing new posts. */
export type BlogPostKind = 'local' | 'external';

export interface BlogPostEntry {
  kind: BlogPostKind;
  title: string;
  /** ISO date (YYYY-MM-DD) for sorting and display */
  date?: string;
  /** Shown on the list page under the title */
  summary?: string;
  /** Required when kind is local — loads assets/blog/{slug}.md */
  slug?: string;
  /** Required when kind is external */
  url?: string;
}

export interface BlogManifest {
  posts: BlogPostEntry[];
}
