import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchMockService, SearchResult } from '../../services/search-mock.service';

@Component({
  selector: 'app-search-page',
  imports: [FormsModule],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class SearchPage {
  private readonly searchService = inject(SearchMockService);

  query = '';
  results: SearchResult[] = this.searchService.getSuggestedResults();

  runSearch(): void {
    this.results = this.searchService.search(this.query);
  }
}
