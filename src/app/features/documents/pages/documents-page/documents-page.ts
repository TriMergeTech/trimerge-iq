import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DocumentsMockService,
  ManagedDocument,
} from '../../services/documents-mock.service';

type ViewMode = 'list' | 'grid';

interface UploadedDocument extends ManagedDocument {
  size?: number;
  uploadDate?: Date;
  progress?: number;
  preview?: string;
}

@Component({
  selector: 'app-documents-page',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './documents-page.html',
  styleUrl: './documents-page.css',
})
export class DocumentsPage {
  private readonly documentsService = inject(DocumentsMockService);

  documents: UploadedDocument[] = this.documentsService.getDocuments().map(document => ({
    ...document,
    size: 1024 * (document.id + 1),
    uploadDate: new Date(),
    progress: document.status === 'Processing' ? 55 : 100,
  }));
  selectedDocument: UploadedDocument = this.documents[0];
  searchQuery = '';
  filterType = 'all';
  viewMode: ViewMode = 'list';
  isDragging = false;

  get filteredDocuments(): UploadedDocument[] {
    return this.documents.filter(document => {
      const matchesSearch =
        !this.searchQuery ||
        [document.name, document.summary, document.type]
          .join(' ')
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());

      const matchesFilter =
        this.filterType === 'all' || document.type.toLowerCase() === this.filterType;

      return matchesSearch && matchesFilter;
    });
  }

  get totalDocumentsLabel(): string {
    return `${this.documents.length} ${this.documents.length === 1 ? 'file' : 'files'}`;
  }

  get totalSize(): number {
    return this.documents.reduce((acc, document) => acc + (document.size ?? 0), 0);
  }

  uploadMockFile(): void {
    const createdDocument = this.documentsService.createMockUpload();
    const nextDocument: UploadedDocument = {
      ...createdDocument,
      size: 1024 * 5,
      uploadDate: new Date(),
      progress: 55,
    };

    this.documents = [nextDocument, ...this.documents];
    this.selectedDocument = nextDocument;
  }

  handleFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    this.processFiles(input.files);
    input.value = '';
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files?.length) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  processFiles(files: FileList): void {
    Array.from(files).forEach(file => {
      const uploadedDocument: UploadedDocument = {
        id: Date.now() + Math.random(),
        name: file.name,
        status: 'Processing',
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        summary: 'Newly uploaded file prepared for parsing and preview.',
        size: file.size,
        uploadDate: new Date(),
        progress: 0,
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = loadEvent => {
          const nextPreview = loadEvent.target?.result as string;
          this.documents = this.documents.map(document =>
            document.id === uploadedDocument.id ? { ...document, preview: nextPreview } : document
          );
          if (this.selectedDocument.id === uploadedDocument.id) {
            this.selectedDocument = { ...this.selectedDocument, preview: nextPreview };
          }
        };
        reader.readAsDataURL(file);
      }

      this.documents = [uploadedDocument, ...this.documents];
      this.selectedDocument = uploadedDocument;
      this.simulateUpload(uploadedDocument.id);
    });
  }

  simulateUpload(documentId: number): void {
    const interval = window.setInterval(() => {
      const currentDocument = this.documents.find(document => document.id === documentId);
      if (!currentDocument) {
        window.clearInterval(interval);
        return;
      }

      const nextProgress = Math.min((currentDocument.progress ?? 0) + 30, 100);
      const nextStatus = nextProgress >= 100 ? 'Ready' : 'Processing';

      this.documents = this.documents.map(document =>
        document.id === documentId
          ? { ...document, progress: nextProgress, status: nextStatus }
          : document
      );

      if (this.selectedDocument.id === documentId) {
        this.selectedDocument = {
          ...this.selectedDocument,
          progress: nextProgress,
          status: nextStatus,
        };
      }

      if (nextProgress >= 100) {
        window.clearInterval(interval);
      }
    }, 400);
  }

  selectDocument(document: UploadedDocument): void {
    this.selectedDocument = document;
  }

  removeDocument(documentId: number): void {
    this.documents = this.documents.filter(document => document.id !== documentId);

    if (this.selectedDocument.id === documentId && this.documents.length) {
      this.selectedDocument = this.documents[0];
    }
  }
}
