import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BlogService } from './blog.service';
import { BlogPostEntry } from './post.models';

@Component({
  selector: 'evg-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
  standalone: false
})
export class PostsComponent implements OnInit {
  posts: BlogPostEntry[] = [];

  constructor(
    private blog: BlogService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Writing — Paul Spears');
    this.blog.getManifest().subscribe(m => {
      this.posts = m.posts;
    });
  }
}
