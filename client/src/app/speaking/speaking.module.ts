import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpeakingRoutingModule } from './speaking-routing.module';
import { SpeakingComponent } from './speaking.component';

@NgModule({
  declarations: [SpeakingComponent],
  imports: [CommonModule, SpeakingRoutingModule]
})
export class SpeakingModule {}
