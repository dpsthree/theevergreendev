import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpeakingRoutingModule } from './speaking-routing.module';
import { SpeakingComponent } from './speaking.component';
import { MatDepsModule } from '../mat-deps/mat-deps.module';

@NgModule({
  declarations: [SpeakingComponent],
  imports: [CommonModule, SpeakingRoutingModule, MatDepsModule]
})
export class SpeakingModule {}
