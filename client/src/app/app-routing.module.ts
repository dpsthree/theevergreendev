import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'bio', pathMatch: 'full' },
  {
    path: 'bio',
    loadChildren: () => import('./bio/bio.module').then(mod => mod.BioModule)
  },
  {
    path: 'speaking',
    loadChildren: () =>
      import('./speaking/speaking.module').then(mod => mod.SpeakingModule)
  },
  {
    path: 'posts',
    loadChildren: () => import('./posts/posts.module').then(mod => mod.PostsModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
