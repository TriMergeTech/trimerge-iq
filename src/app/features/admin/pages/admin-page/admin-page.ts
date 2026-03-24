import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminAction,
  AdminMockService,
  AdminStat,
} from '../../services/admin-mock.service';

type AdminTab = 'users' | 'data' | 'monitoring';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created: string;
  lastLogin: string;
}

interface AdminRecord {
  id: number;
  title: string;
  category: string;
  status: 'active' | 'inactive';
  created: string;
  updated: string;
}

type EditableUser = Omit<AdminUser, 'id'> & { id?: number };
type EditableRecord = Omit<AdminRecord, 'id'> & { id?: number };

@Component({
  selector: 'app-admin-page',
  imports: [FormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage {
  private readonly adminService = inject(AdminMockService);

  activeTab: AdminTab = 'users';
  searchQuery = '';
  filterRole = 'all';
  filterStatus = 'all';
  showUserModal = false;
  showDataModal = false;
  editingUser: EditableUser | null = null;
  editingRecord: EditableRecord | null = null;

  stats: AdminStat[] = this.adminService.getStats();
  actions: AdminAction[] = this.adminService.getActions();
  alerts: string[] = this.adminService.getAlerts();

  readonly users: AdminUser[] = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@trimerge.com',
      role: 'admin',
      created: 'Jan 15, 2024',
      lastLogin: 'Mar 24, 2026',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@trimerge.com',
      role: 'user',
      created: 'Feb 20, 2024',
      lastLogin: 'Mar 23, 2026',
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'm.chen@trimerge.com',
      role: 'user',
      created: 'Mar 10, 2024',
      lastLogin: 'Mar 22, 2026',
    },
  ];

  readonly records: AdminRecord[] = [
    {
      id: 1,
      title: 'Q1 Financial Report',
      category: 'Finance',
      status: 'active',
      created: 'Jan 05, 2026',
      updated: 'Mar 15, 2026',
    },
    {
      id: 2,
      title: 'Client Proposal - ABC Corp',
      category: 'Sales',
      status: 'active',
      created: 'Feb 10, 2026',
      updated: 'Mar 20, 2026',
    },
    {
      id: 3,
      title: 'Marketing Strategy 2026',
      category: 'Marketing',
      status: 'inactive',
      created: 'Jan 20, 2026',
      updated: 'Feb 28, 2026',
    },
  ];

  get filteredUsers(): AdminUser[] {
    return this.users.filter(user => {
      const matchesSearch =
        !this.searchQuery ||
        [user.name, user.email].join(' ').toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesRole = this.filterRole === 'all' || user.role === this.filterRole;
      return matchesSearch && matchesRole;
    });
  }

  get filteredRecords(): AdminRecord[] {
    return this.records.filter(record => {
      const matchesSearch =
        !this.searchQuery ||
        [record.title, record.category]
          .join(' ')
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.filterStatus === 'all' || record.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  openUserModal(user?: AdminUser): void {
    this.editingUser = user
      ? { ...user }
      : {
          name: '',
          email: '',
          role: 'user',
          created: new Date().toLocaleDateString(),
          lastLogin: new Date().toLocaleDateString(),
        };
    this.showUserModal = true;
  }

  openRecordModal(record?: AdminRecord): void {
    this.editingRecord = record
      ? { ...record }
      : {
          title: '',
          category: '',
          status: 'active',
          created: new Date().toLocaleDateString(),
          updated: new Date().toLocaleDateString(),
        };
    this.showDataModal = true;
  }

  saveUser(): void {
    if (!this.editingUser) {
      return;
    }

    if (this.editingUser.id) {
      const index = this.users.findIndex(user => user.id === this.editingUser?.id);
      if (index !== -1) {
        this.users[index] = this.editingUser as AdminUser;
      }
    } else {
      this.users.unshift({
        ...(this.editingUser as AdminUser),
        id: Date.now(),
      });
    }

    this.closeModals();
  }

  saveRecord(): void {
    if (!this.editingRecord) {
      return;
    }

    if (this.editingRecord.id) {
      const index = this.records.findIndex(record => record.id === this.editingRecord?.id);
      if (index !== -1) {
        this.records[index] = this.editingRecord as AdminRecord;
      }
    } else {
      this.records.unshift({
        ...(this.editingRecord as AdminRecord),
        id: Date.now(),
      });
    }

    this.closeModals();
  }

  closeModals(): void {
    this.showUserModal = false;
    this.showDataModal = false;
    this.editingUser = null;
    this.editingRecord = null;
  }
}
