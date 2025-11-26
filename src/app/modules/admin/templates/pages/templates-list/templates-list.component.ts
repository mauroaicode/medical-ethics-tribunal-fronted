import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { TemplateService } from '@app/core/services/template/template.service';
import { Template, TemplateFilter, SyncTemplatesResponse } from '@app/core/models/template/template.model';
import { TemplateListComponent } from '../../components/template-list/template-list.component';

@Component({
  selector: 'app-templates-list',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, TemplateListComponent],
  templateUrl: './templates-list.component.html',
  styleUrls: ['./templates-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplatesListComponent {
  private _templateService = inject(TemplateService);
  private _translocoService = inject(TranslocoService);

  // State
  public templates = signal<Template[]>([]);
  public loading = signal<boolean>(false);
  public syncing = signal<boolean>(false);
  public searchValue = signal<string>('');

  constructor() {
    this.loadTemplates();
  }

  /**
   * Load templates with current filters
   */
  loadTemplates(name?: string): void {
    this.loading.set(true);
    this.searchValue.set(name || '');

    const filters: TemplateFilter = {
      name: name?.trim() || undefined,
    };

    // Remove empty values
    Object.keys(filters).forEach((key) => {
      const value = filters[key as keyof TemplateFilter];
      if (value === '' || value === null || value === undefined) {
        delete filters[key as keyof TemplateFilter];
      }
    });

    this._templateService.getTemplates(filters).subscribe({
      next: (templates) => {
        this.templates.set(templates);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.loading.set(false);
      },
    });
  }

  /**
   * Handle search
   */
  onSearch(name: string): void {
    this.loadTemplates(name);
  }

  /**
   * Handle search reset
   */
  onResetSearch(): void {
    this.loadTemplates();
  }

  /**
   * Sync templates from Google Drive
   */
  syncTemplates(): void {
    this.syncing.set(true);

    this._templateService.syncTemplates().subscribe({
      next: (response: SyncTemplatesResponse) => {
        // Update templates with synced data
        this.templates.set(response.templates);
        this.syncing.set(false);
        
        // Show success message
        const message = this._translocoService.translate('templates.sync.success', {
          count: response.templates.length,
        });
        console.log(message);
      },
      error: (error) => {
        console.error('Error syncing templates:', error);
        this.syncing.set(false);
      },
    });
  }

  /**
   * Open template in Google Docs (new tab)
   */
  openTemplateInDocs(webViewLink: string): void {
    if (webViewLink) {
      window.open(webViewLink, '_blank', 'noopener,noreferrer');
    }
  }
}

