import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BioRoutingModule } from './bio-routing.module';
import { BioComponent } from './bio.component';
import { MatDepsModule } from '../mat-deps/mat-deps.module';

@NgModule({
  declarations: [BioComponent],
  imports: [CommonModule, BioRoutingModule, MatDepsModule]
})
export class BioModule {}
