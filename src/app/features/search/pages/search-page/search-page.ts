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
  hasSearched = false;
  showFilters = false;
  sortBy = 'relevance';
  filterType = 'all';
  dateRange = 'all';
  results: SearchResult[] = this.searchService.getSuggestedResults();

  get filteredResults(): SearchResult[] {
    let filtered = [...this.results];

    if (this.filterType !== 'all') {
      filtered = filtered.filter(result =>
        result.category.toLowerCase().includes(this.filterType.toLowerCase())
      );
    }

    switch (this.sortBy) {
      case 'score':
        filtered.sort((a, b) => b.score - a.score);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        filtered.sort((a, b) => b.score - a.score);
    }

    return filtered;
  }

  get previewResults(): SearchResult[] {
    return this.filteredResults.slice(0, 5);
  }

  runSearch(): void {
    const trimmedQuery = this.query.trim();
    this.hasSearched = !!trimmedQuery;
    this.results = this.searchService.search(trimmedQuery);
  }

  clearSearch(): void {
    this.query = '';
    this.hasSearched = false;
    this.showFilters = false;
    this.results = this.searchService.getSuggestedResults();
  }

  showExampleSearch(query: string, withFilters = false): void {
    this.query = query;
    this.hasSearched = true;
    this.showFilters = withFilters;
    this.results = this.searchService.search(query);
  }

  toggleFilters(): void {
    if (!this.hasSearched) {
      this.showExampleSearch('document processing', true);
      return;
    }

    this.showFilters = !this.showFilters;
  }
}
