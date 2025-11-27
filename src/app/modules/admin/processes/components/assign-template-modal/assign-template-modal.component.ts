import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { TemplateService } from '@app/core/services/template/template.service';
import { Template } from '@app/core/models/template/template.model';
import { TemplateListComponent } from '@app/modules/admin/templates/components/template-list/template-list.component';

@Component({
  selector: 'app-assign-template-modal',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, TemplateListComponent],
  templateUrl: './assign-template-modal.component.html',
  styleUrls: ['./assign-template-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignTemplateModalComponent {
  private _templateService = inject(TemplateService);

  // Inputs
  isOpen = input<boolean>(false);
  processId = input<number | null>(null);
  shouldAssign = input<boolean>(false);

  // Outputs
  onClose = output<void>();
  onAssign = output<{ templateId: number; processId: number }>(); // template_id and process_id
  onAssignSuccess = output<void>(); // Emitted when assignment is successful

  // State
  templates = signal<Template[]>([]);
  loading = signal<boolean>(false);
  searchValue = signal<string>('');
  selectedTemplate = signal<Template | null>(null);
  assigning = signal<boolean>(false);
  error = signal<string | null>(null);
  private _lastShouldAssign = false;

  /**
   * Load templates
   */
  loadTemplates(): void {
    this.loading.set(true);
    this.searchValue.set('');

    this._templateService.getTemplates({}).subscribe({
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
  handleSearch(name: string): void {
    this.searchValue.set(name);
    this.loading.set(true);

    this._templateService.getTemplates({ name }).subscribe({
      next: (templates) => {
        this.templates.set(templates);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching templates:', error);
        this.loading.set(false);
      },
    });
  }

  /**
   * Handle search reset
   */
  handleResetSearch(): void {
    this.searchValue.set('');
    this.loadTemplates();
  }

  /**
   * Handle template selection
   */
  handleSelect(template: Template): void {
    this.selectedTemplate.set(template);
  }

  /**
   * Handle assign (shows confirmation dialog)
   */
  handleAssign(): void {
    const selected = this.selectedTemplate();
    const processId = this.processId();
    if (selected && processId) {
      // Emit event to parent to show confirmation
      this.onAssign.emit({ templateId: selected.id, processId });
    }
  }

  /**
   * Assign template (called by parent after confirmation)
   */
  assignTemplate(): void {
    const selected = this.selectedTemplate();
    const processId = this.processId();

    if (!selected || !processId) {
      return;
    }

    this.assigning.set(true);
    this.error.set(null);

    this._templateService
      .assignTemplateToProcess({
        process_id: processId,
        template_id: selected.id,
      })
      .subscribe({
        next: () => {
          this.assigning.set(false);
          this.selectedTemplate.set(null);
          // Emit success to parent to close modal and reload templates
          this.onAssignSuccess.emit();
        },
        error: (error) => {
          console.error('Error assigning template:', error);
          this.assigning.set(false);
          this.error.set(
            error?.error?.message || 'process.detail.assignError'
          );
        },
      });
  }

  /**
   * Reset error
   */
  resetError(): void {
    this.error.set(null);
  }

  /**
   * Handle cancel
   */
  handleCancel(): void {
    this.selectedTemplate.set(null);
    this.onClose.emit();
  }

  /**
   * Handle close
   */
  handleClose(): void {
    this.selectedTemplate.set(null);
    this.onClose.emit();
  }

  /**
   * Effect to load templates when modal opens
   */
  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadTemplates();
        this.selectedTemplate.set(null);
        this.error.set(null);
        this.assigning.set(false);
      }
    });

    // Effect to trigger assignment when shouldAssign becomes true
    effect(() => {
      const shouldAssign = this.shouldAssign();
      // Only trigger if shouldAssign changed from false to true
      if (shouldAssign && !this._lastShouldAssign && this.selectedTemplate() && this.processId()) {
        this.assignTemplate();
      }
      this._lastShouldAssign = shouldAssign;
    });
  }
}

