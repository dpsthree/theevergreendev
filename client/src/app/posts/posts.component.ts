import { Component, OnInit } from '@angular/core';

interface Post {
  url: string;
  title: string;
}

const posts: Post[] = [
  {
    title: '3 Tips for Angular Runtime Performance from the Real World',
    url:
      'https://blog.angular.io/3-tips-for-angular-runtime-performance-from-the-real-world-d467fbc8f66e'
  },
  {
    title: 'Angular Runtime Performance Guide',
    url: 'https://blog.oasisdigital.com/2017/angular-runtime-performance-guide/'
  }
];

@Component({
  selector: 'evg-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  posts: Post[] = posts;
  constructor() {}

  ngOnInit() {}
}
