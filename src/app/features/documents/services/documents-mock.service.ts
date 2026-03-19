import { Injectable } from '@angular/core';

export interface ManagedDocument {
  id: number;
  name: string;
  status: 'Ready' | 'Processing' | 'Indexed';
  type: string;
  summary: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentsMockService {
  private readonly documents: ManagedDocument[] = [
    {
      id: 1,
      name: 'project-brief.pdf',
      status: 'Ready',
      type: 'PDF',
      summary: 'Project overview with objectives, owners, and timeline.',
    },
    {
      id: 2,
      name: 'meeting-notes.docx',
      status: 'Processing',
      type: 'DOCX',
      summary: 'Working notes prepared for extraction and indexing.',
    },
    {
      id: 3,
      name: 'contract-summary.txt',
      status: 'Indexed',
      type: 'TXT',
      summary: 'Normalized text prepared for semantic search workflows.',
    },
  ];

  getDocuments(): ManagedDocument[] {
    return this.documents;
  }

  createMockUpload(): ManagedDocument {
    const nextDocument: ManagedDocument = {
      id: this.documents.length + 1,
      name: `upload-${this.documents.length + 1}.pdf`,
      status: 'Processing',
      type: 'PDF',
      summary: 'Newly uploaded mock file queued for parsing and preview.',
    };

    this.documents.unshift(nextDocument);
    return nextDocument;
  }
}
