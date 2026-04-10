import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subject, catchError, filter, map, switchMap, takeUntil } from 'rxjs';
import { BlogService } from './blog.service';
import { BlogPostEntry } from './post.models';
import { renderMarkdown } from './markdown';

@Component({
  selector: 'evg-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
  standalone: false
})
export class PostDetailComponent implements OnInit, OnDestroy {
  post: BlogPostEntry | null = null;
  contentHtml: SafeHtml | null = null;
  loadError = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blog: BlogService,
    private sanitizer: DomSanitizer,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(params => params.get('slug')),
        filter((slug): slug is string => !!slug),
        switchMap(slug => {
          this.post = null;
          this.contentHtml = null;
          this.loadError = false;
          return this.blog.getPostBySlug(slug).pipe(
            switchMap(entry => {
              if (!entry?.slug || entry.kind !== 'local') {
                void this.router.navigate(['/posts']);
                return EMPTY;
              }
              this.post = entry;
              this.title.setTitle(`${entry.title} — Paul Spears`);
              return this.blog.loadMarkdown(entry.slug).pipe(
                catchError(() => {
                  this.loadError = true;
                  return EMPTY;
                })
              );
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(md => {
        const html = renderMarkdown(md);
        this.contentHtml = this.sanitizer.bypassSecurityTrustHtml(html);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.title.setTitle('Paul Spears — The Evergreen Dev');
  }
}
