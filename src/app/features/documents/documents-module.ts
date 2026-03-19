import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentsRoutingModule } from './documents-routing-module';
import { DocumentsPage } from './pages/documents-page/documents-page';

@NgModule({
  imports: [CommonModule, DocumentsRoutingModule, DocumentsPage],
})
export class DocumentsModule {}
