import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { AdminPage } from './pages/admin-page/admin-page';

@NgModule({
  imports: [CommonModule, AdminRoutingModule, AdminPage],
})
export class AdminModule {}
