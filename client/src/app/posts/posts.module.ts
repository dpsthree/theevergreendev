import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostDetailComponent } from './post-detail.component';
import { PostsComponent } from './posts.component';
import { PostsRoutingModule } from './posts-routing.module';

@NgModule({
  declarations: [PostsComponent, PostDetailComponent],
  imports: [CommonModule, PostsRoutingModule]
})
export class PostsModule {}
