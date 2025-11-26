import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  // Inputs
  public isOpen = input<boolean>(false);
  public title = input<string>('');
  public message = input<string>('');
  public confirmLabel = input<string>('common.confirm');
  public cancelLabel = input<string>('common.cancel');
  public confirmButtonClass = input<string>('btn-primary');
  public cancelButtonClass = input<string>('btn-ghost');

  // Outputs
  public confirm = output<void>();
  public cancel = output<void>();
  public close = output<void>();

  /**
   * Handle confirm action
   */
  onConfirm(): void {
    this.confirm.emit();
  }

  /**
   * Handle cancel action
   */
  onCancel(): void {
    this.cancel.emit();
    this.close.emit();
  }

  /**
   * Handle close action
   */
  onClose(): void {
    this.close.emit();
  }
}

