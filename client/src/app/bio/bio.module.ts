import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BioRoutingModule } from './bio-routing.module';
import { BioComponent } from './bio.component';

@NgModule({
  declarations: [BioComponent],
  imports: [CommonModule, BioRoutingModule]
})
export class BioModule {}
