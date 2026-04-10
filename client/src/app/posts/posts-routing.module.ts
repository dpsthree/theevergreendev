import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostDetailComponent } from './post-detail.component';
import { PostsComponent } from './posts.component';

const routes: Routes = [
  { path: '', component: PostsComponent },
  { path: ':slug', component: PostDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostsRoutingModule {}
