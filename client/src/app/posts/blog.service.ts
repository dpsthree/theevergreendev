import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { BlogManifest, BlogPostEntry } from './post.models';

const MANIFEST_URL = 'assets/blog/posts.json';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private manifest$?: Observable<BlogManifest>;

  constructor(private http: HttpClient) {}

  /** Sorted newest first when dates exist; stable order otherwise */
  getManifest(): Observable<BlogManifest> {
    if (!this.manifest$) {
      this.manifest$ = this.http.get<BlogManifest>(MANIFEST_URL).pipe(
        map(m => ({
          posts: [...m.posts].sort((a, b) => this.postSortKey(b) - this.postSortKey(a))
        })),
        shareReplay(1)
      );
    }
    return this.manifest$;
  }

  getPostBySlug(slug: string): Observable<BlogPostEntry | undefined> {
    return this.getManifest().pipe(
      map(m => m.posts.find(p => p.kind === 'local' && p.slug === slug))
    );
  }

  loadMarkdown(slug: string): Observable<string> {
    return this.http.get(`assets/blog/${slug}.md`, { responseType: 'text' });
  }

  private postSortKey(p: BlogPostEntry): number {
    if (!p.date) {
      return 0;
    }
    const t = Date.parse(p.date);
    return Number.isNaN(t) ? 0 : t;
  }
}
