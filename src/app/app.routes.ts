import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'search',
    loadChildren: () =>
      import('./features/search/search-module').then(m => m.SearchModule)
  },
  {
    path: 'chat',
    loadChildren: () =>
      import('./features/chat/chat-module').then(m => m.ChatModule)
  },
  {
    path: 'documents',
    loadChildren: () =>
      import('./features/documents/documents-module').then(m => m.DocumentsModule)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin-module').then(m => m.AdminModule)
  },
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  }
]