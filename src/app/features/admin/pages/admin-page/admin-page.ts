import { Component, inject } from '@angular/core';
import {
  AdminAction,
  AdminMockService,
  AdminStat,
} from '../../services/admin-mock.service';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage {
  private readonly adminService = inject(AdminMockService);

  stats: AdminStat[] = this.adminService.getStats();
  actions: AdminAction[] = this.adminService.getActions();
  alerts: string[] = this.adminService.getAlerts();
}
