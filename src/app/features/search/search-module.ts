import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing-module';
import { SearchPage } from './pages/search-page/search-page';

@NgModule({
  imports: [CommonModule, SearchRoutingModule, SearchPage],
})
export class SearchModule {}
