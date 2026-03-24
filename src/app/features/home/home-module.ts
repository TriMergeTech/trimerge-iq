import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing-module';
import { HomePage } from './pages/home-page/home-page';

@NgModule({
  imports: [CommonModule, HomeRoutingModule, HomePage],
})
export class HomeModule {}
