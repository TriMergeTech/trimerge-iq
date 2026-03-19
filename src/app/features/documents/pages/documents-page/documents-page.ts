import { Component, inject } from '@angular/core';
import {
  DocumentsMockService,
  ManagedDocument,
} from '../../services/documents-mock.service';

@Component({
  selector: 'app-documents-page',
  templateUrl: './documents-page.html',
  styleUrl: './documents-page.css',
})
export class DocumentsPage {
  private readonly documentsService = inject(DocumentsMockService);

  documents: ManagedDocument[] = this.documentsService.getDocuments();
  selectedDocument: ManagedDocument = this.documents[0];

  uploadMockFile(): void {
    this.selectedDocument = this.documentsService.createMockUpload();
    this.documents = this.documentsService.getDocuments();
  }

  selectDocument(document: ManagedDocument): void {
    this.selectedDocument = document;
  }
}
