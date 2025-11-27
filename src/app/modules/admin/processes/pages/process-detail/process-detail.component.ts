import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ProcessService } from '@app/core/services/process/process.service';
import { TemplateService } from '@app/core/services/template/template.service';
import { ProcessDetail } from '@app/core/models/process/process.model';
import { ProcessTemplate } from '@app/core/models/template/template.model';
import { AssignTemplateModalComponent } from '../../components/assign-template-modal/assign-template-modal.component';
import { ConfirmationDialogComponent } from '@app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-process-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoPipe,
    AssignTemplateModalComponent,
    ConfirmationDialogComponent,
  ],
  templateUrl: './process-detail.component.html',
  styleUrls: ['./process-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessDetailComponent {
  private _processService = inject(ProcessService);
  private _templateService = inject(TemplateService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _translocoService = inject(TranslocoService);

  // State
  public process = signal<ProcessDetail | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public processTemplates = signal<ProcessTemplate[]>([]);
  public loadingTemplates = signal<boolean>(false);
  public isAssignModalOpen = signal<boolean>(false);
  public isConfirmDialogOpen = signal<boolean>(false);
  public selectedTemplateId = signal<number | null>(null);

  constructor() {
    this.loadProcess();

    // Load templates when process is loaded
    effect(() => {
      const process = this.process();
      if (process) {
        this.loadProcessTemplates(process.slug);
      }
    });
  }

  /**
   * Load process detail by slug
   */
  loadProcess(): void {
    const slug = this._route.snapshot.paramMap.get('slug');

    if (!slug) {
      console.error('Process slug not found in route params');
      this.error.set('process.detail.slugNotFound');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this._processService.getProcessBySlug(slug).subscribe({
      next: (process) => {
        this.process.set(process);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading process:', error);
        this.error.set('process.detail.loadError');
        this.loading.set(false);
      },
    });
  }

  /**
   * Navigate back to processes list
   */
  onBack(): void {
    this._router.navigate(['/admin/processes']);
  }

  /**
   * Open template in Google Docs (new tab)
   */
  openTemplateInDocs(webViewLink: string | null): void {
    if (webViewLink) {
      window.open(webViewLink, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('cerrado') || statusLower.includes('closed')) {
      return 'badge-neutral';
    } else if (statusLower.includes('proceso') || statusLower.includes('progress')) {
      return 'badge-success';
    } else if (statusLower.includes('borrador') || statusLower.includes('draft')) {
      return 'badge-warning';
    }
    return 'badge';
  }

  /**
   * Load process templates
   */
  loadProcessTemplates(slug: string): void {
    this.loadingTemplates.set(true);

    this._templateService.getProcessTemplates(slug).subscribe({
      next: (templates) => {
        this.processTemplates.set(templates);
        this.loadingTemplates.set(false);
      },
      error: (error) => {
        console.error('Error loading process templates:', error);
        this.loadingTemplates.set(false);
      },
    });
  }

  /**
   * Handle assign template (open modal)
   */
  onAssignTemplate(): void {
    this.isAssignModalOpen.set(true);
  }

  /**
   * Handle modal close
   */
  onCloseAssignModal(): void {
    this.isAssignModalOpen.set(false);
    this.selectedTemplateId.set(null);
  }

  /**
   * Handle template selection from modal (shows confirmation)
   */
  onTemplateSelected(data: { templateId: number; processId: number }): void {
    this.selectedTemplateId.set(data.templateId);
    // Keep modal open, just show confirmation dialog
    this.isConfirmDialogOpen.set(true);
  }

  /**
   * Handle confirmation dialog confirm
   */
  onConfirmAssign(): void {
    const process = this.process();
    const templateId = this.selectedTemplateId();

    if (!process || !templateId) {
      return;
    }

    // Close confirmation dialog, keep assign modal open
    // The modal will handle the assignment and show loading/error states
    this.isConfirmDialogOpen.set(false);
    
    // Trigger assignment in modal
    this.shouldAssign.set(true);
    // Reset after a tick to allow the effect to trigger
    setTimeout(() => {
      this.shouldAssign.set(false);
    }, 0);
  }

  // Signal to trigger assignment in modal
  public shouldAssign = signal<boolean>(false);

  /**
   * Handle confirmation dialog cancel
   */
  onCancelAssign(): void {
    this.isConfirmDialogOpen.set(false);
    this.selectedTemplateId.set(null);
  }

  /**
   * Handle assign success (called by modal after successful assignment)
   */
  onAssignSuccess(): void {
    const process = this.process();
    if (process) {
      // Reload templates
      this.loadProcessTemplates(process.slug);
      // Close all modals
      this.isAssignModalOpen.set(false);
      this.isConfirmDialogOpen.set(false);
      this.selectedTemplateId.set(null);
    }
  }
}

