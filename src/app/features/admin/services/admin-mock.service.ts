import { Injectable } from '@angular/core';

export interface AdminStat {
  label: string;
  value: string;
}

export interface AdminAction {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminMockService {
  getStats(): AdminStat[] {
    return [
      { label: 'Active Users', value: '128' },
      { label: 'Pending Jobs', value: '14' },
      { label: 'Storage Usage', value: '62%' },
    ];
  }

  getActions(): AdminAction[] {
    return [
      {
        title: 'User administration',
        description: 'Future space for permissions, roles, and account review workflows.',
      },
      {
        title: 'System monitoring',
        description: 'Reserve this area for service health checks, logs, and alert summaries.',
      },
      {
        title: 'Configuration',
        description: 'Use this section later for environment settings and admin-level controls.',
      },
    ];
  }

  getAlerts(): string[] {
    return [
      'Background sync is healthy.',
      'No critical incidents detected.',
      'Two review tasks are waiting for approval.',
    ];
  }
}
