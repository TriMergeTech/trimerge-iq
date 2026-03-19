import { Injectable } from '@angular/core';

export interface SearchResult {
  id: number;
  title: string;
  summary: string;
  category: string;
  score: number;
}

@Injectable({
  providedIn: 'root',
})
export class SearchMockService {
  private readonly results: SearchResult[] = [
    {
      id: 1,
      title: 'Customer Onboarding Workflow',
      summary: 'Covers identity checks, document review, and account activation milestones.',
      category: 'Operations',
      score: 98,
    },
    {
      id: 2,
      title: 'AI Assistant Response Guidelines',
      summary: 'Reference notes for answer formatting, tone, and compliance checks.',
      category: 'Knowledge Base',
      score: 95,
    },
    {
      id: 3,
      title: 'Quarterly Revenue Snapshot',
      summary: 'High-level metrics with market breakdowns and trend commentary.',
      category: 'Analytics',
      score: 91,
    },
    {
      id: 4,
      title: 'Document Processing Pipeline',
      summary: 'Describes ingestion, parsing, enrichment, and export stages.',
      category: 'Engineering',
      score: 89,
    },
  ];

  getSuggestedResults(): SearchResult[] {
    return this.results;
  }

  search(query: string): SearchResult[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return this.getSuggestedResults();
    }

    return this.results.filter((result) =>
      [result.title, result.summary, result.category].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }
}
