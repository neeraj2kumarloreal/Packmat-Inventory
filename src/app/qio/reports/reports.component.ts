import { Component } from '@angular/core';
import { QIOWithDetails } from 'src/app/types/qio.types';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  qios: QIOWithDetails[] = [];
  filteredQIOs: QIOWithDetails[] = [];
  selectedImage: string | null = null;

  statusFilter = '';
  categoryFilter = '';
  criticalityFilter = '';

  stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0
  };
  // private supabaseService: SupabaseService
  constructor() { }

  async ngOnInit() {
    await this.loadQIOs();
  }

  async loadQIOs() {
    try {
      // this.qios = await this.supabaseService.getQIOs();
      this.applyFilters();
      this.calculateStats();
    } catch (error) {
      console.error('Error loading QIOs:', error);
    }
  }

  applyFilters() {
    this.filteredQIOs = this.qios.filter(qio => {
      if (this.statusFilter && qio.status !== this.statusFilter) return false;
      if (this.categoryFilter && qio.category !== this.categoryFilter) return false;
      if (this.criticalityFilter && qio.criticality !== this.criticalityFilter) return false;
      return true;
    });
  }

  calculateStats() {
    this.stats.total = this.qios.length;
    this.stats.open = this.qios.filter(q => q.status === 'Open').length;
    this.stats.inProgress = this.qios.filter(q => q.status === 'In Progress').length;
    this.stats.closed = this.qios.filter(q => q.status === 'Closed').length;
  }

  async updateStatus(qio: QIOWithDetails) {
    try {
      // await this.supabaseService.updateQIOStatus(qio.id!, qio.status!);
      this.calculateStats();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  isOverdue(targetDate: string | undefined, status: string | undefined): boolean {
    if (!targetDate || status === 'Closed') return false;
    return new Date(targetDate) < new Date();
  }

  getCategoryClass(category: string): string {
    return category.toLowerCase().replace(/\s+/g, '-');
  }

  viewImage(url: string | undefined) {
    if (url) {
      this.selectedImage = url;
    }
  }

  closeImage() {
    this.selectedImage = null;
  }
}
