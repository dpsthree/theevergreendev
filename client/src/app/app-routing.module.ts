import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BioModule } from './bio/bio.module';
import { SpeakingModule } from './speaking/speaking.module';
import { PostsModule } from './posts/posts.module';

const routes: Routes = [
  { path: '', redirectTo: 'bio', pathMatch: 'full' },
  {
    path: 'bio',
    loadChildren: () => import('./bio/bio.module').then(mod => BioModule)
  },
  {
    path: 'speaking',
    loadChildren: () =>
      import('./speaking/speaking.module').then(mod => SpeakingModule)
  },
  {
    path: 'posts',
    loadChildren: () => import('./posts/posts.module').then(mod => PostsModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
