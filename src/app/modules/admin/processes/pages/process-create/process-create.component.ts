import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ProcessService } from '@app/core/services/process/process.service';
import { DoctorService } from '@app/core/services/doctor/doctor.service';
import { ComplainantService } from '@app/core/services/complainant/complainant.service';
import { MagistrateService } from '@app/core/services/magistrate/magistrate.service';
import { CreateProcessRequest } from '@app/core/models/process/process.model';
import { Doctor } from '@app/core/models/doctor/doctor.model';
import { Complainant } from '@app/core/models/complainant/complainant.model';
import { Magistrate } from '@app/core/models/magistrate/magistrate.model';
import {
  SearchableSelectComponent,
  SearchableSelectOption,
} from '@app/shared/components/searchable-select/searchable-select.component';
import { DatePickerComponent } from '@app/shared/components/date-picker/date-picker.component';
import { ConfirmationDialogComponent } from '@app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorHandlerService } from '@app/core/services/error/error-handler.service';

@Component({
  selector: 'app-process-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoPipe,
    SearchableSelectComponent,
    DatePickerComponent,
    ConfirmationDialogComponent,
  ],
  templateUrl: './process-create.component.html',
  styleUrls: ['./process-create.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessCreateComponent {
  private _processService = inject(ProcessService);
  private _doctorService = inject(DoctorService);
  private _complainantService = inject(ComplainantService);
  private _magistrateService = inject(MagistrateService);
  private _router = inject(Router);
  private _fb = inject(FormBuilder);
  private _translocoService = inject(TranslocoService);
  private _errorHandlerService = inject(ErrorHandlerService);

  // State
  public loading = signal<boolean>(false);
  public showConfirmation = signal<boolean>(false);
  public showCancelConfirmation = signal<boolean>(false);
  public error = signal<string | null>(null);
  public hasUnsavedChanges = signal<boolean>(false);

  // Options for selects
  public complainantOptions = signal<SearchableSelectOption[]>([]);
  public doctorOptions = signal<SearchableSelectOption[]>([]);
  public magistrateInstructorOptions = signal<SearchableSelectOption[]>([]);
  public magistratePonenteOptions = signal<SearchableSelectOption[]>([]);

  // Form
  public processForm: FormGroup = this._fb.group({
    complainant_id: [null, [Validators.required]],
    doctor_id: [null, [Validators.required]],
    magistrate_instructor_id: [null, [Validators.required]],
    magistrate_ponente_id: [null, [Validators.required]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    start_date: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor() {
    this.loadOptions();
    this._setupFormChangeDetection();
    this._setupBeforeUnload();
  }

  /**
   * Setup form change detection
   */
  private _setupFormChangeDetection(): void {
    this.processForm.valueChanges.subscribe(() => {
      const formValue = this.processForm.value;
      const hasData = !!(
        formValue.complainant_id ||
        formValue.doctor_id ||
        formValue.magistrate_instructor_id ||
        formValue.magistrate_ponente_id ||
        formValue.name?.trim() ||
        formValue.start_date ||
        formValue.description?.trim()
      );
      this.hasUnsavedChanges.set(hasData);
    });
  }

  /**
   * Setup beforeunload event to prevent page reload
   */
  private _setupBeforeUnload(): void {
    window.addEventListener('beforeunload', (event) => {
      if (this.hasUnsavedChanges()) {
        event.preventDefault();
        event.returnValue = this._translocoService.translate('process.create.unsavedChangesWarning');
        return event.returnValue;
      }
    });
  }

  /**
   * Load all options for selects
   */
  loadOptions(): void {
    this._complainantService.getComplainants().subscribe({
      next: (complainants) => {
        const options: SearchableSelectOption[] = complainants.map(
          (complainant) => ({
            id: complainant.id,
            label: `${complainant.name} ${complainant.last_name}`.trim(),
            value: complainant.id,
          })
        );
        this.complainantOptions.set(options);
      },
      error: (error) => {
        console.error('Error loading complainants:', error);
        const errorMsg = this._errorHandlerService.getErrorMessage(error);
        this.error.set(
          errorMsg ||
            this._translocoService.translate('process.create.errors.loadComplainants')
        );
      },
    });

    // Load doctors
    this._doctorService.getActiveDoctors().subscribe({
      next: (doctors) => {
        const options: SearchableSelectOption[] = doctors.map((doctor) => ({
          id: doctor.id,
          label: doctor.full_name,
          value: doctor.id,
        }));
        this.doctorOptions.set(options);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        const errorMsg = this._errorHandlerService.getErrorMessage(error);
        this.error.set(
          errorMsg ||
            this._translocoService.translate('process.create.errors.loadDoctors')
        );
      },
    });

    // Load magistrates (for both instructor and ponente)
    this._magistrateService.getMagistrates().subscribe({
      next: (magistrates) => {
        const options: SearchableSelectOption[] = magistrates.map(
          (magistrate) => ({
            id: magistrate.id,
            label: `${magistrate.name} ${magistrate.last_name}`.trim(),
            value: magistrate.id,
          })
        );
        this.magistrateInstructorOptions.set(options);
        this.magistratePonenteOptions.set(options);
      },
      error: (error) => {
        console.error('Error loading magistrates:', error);
        const errorMsg = this._errorHandlerService.getErrorMessage(error);
        this.error.set(
          errorMsg ||
            this._translocoService.translate('process.create.errors.loadMagistrates')
        );
      },
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.processForm.invalid) {
      this.processForm.markAllAsTouched();
      return;
    }

    this.showConfirmation.set(true);
  }

  /**
   * Handle confirmation
   */
  onConfirm(): void {
    this.showConfirmation.set(false);
    this.loading.set(true);
    this.error.set(null);

    const formValue = this.processForm.value;
    const processData: CreateProcessRequest = {
      complainant_id: formValue.complainant_id,
      doctor_id: formValue.doctor_id,
      magistrate_instructor_id: formValue.magistrate_instructor_id,
      magistrate_ponente_id: formValue.magistrate_ponente_id,
      name: formValue.name.trim(),
      start_date: formValue.start_date,
      description: formValue.description.trim(),
    };

    this._processService.createProcess(processData).subscribe({
      next: () => {
        this.loading.set(false);
        this.hasUnsavedChanges.set(false);
        this._router.navigate(['/admin/processes']);
      },
      error: (error) => {
        console.error('Error creating process:', error);
        const errorMsg = this._errorHandlerService.getErrorMessage(error);
        this.error.set(
          errorMsg ||
            this._translocoService.translate('process.create.errors.createFailed')
        );
        this.loading.set(false);
      },
    });
  }

  /**
   * Handle cancel confirmation
   */
  onCancelConfirmation(): void {
    this.showConfirmation.set(false);
  }

  /**
   * Handle close confirmation
   */
  onCloseConfirmation(): void {
    this.showConfirmation.set(false);
  }

  /**
   * Handle cancel and go back
   */
  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      this.showCancelConfirmation.set(true);
    } else {
      this._router.navigate(['/admin/processes']);
    }
  }

  /**
   * Handle confirm cancel
   */
  onConfirmCancel(): void {
    this.showCancelConfirmation.set(false);
    this.hasUnsavedChanges.set(false);
    this._router.navigate(['/admin/processes']);
  }

  /**
   * Handle cancel cancel confirmation
   */
  onCancelCancelConfirmation(): void {
    this.showCancelConfirmation.set(false);
  }

  /**
   * Handle close cancel confirmation
   */
  onCloseCancelConfirmation(): void {
    this.showCancelConfirmation.set(false);
  }

  /**
   * Get error message for a form control
   */
  getErrorMessage(controlName: string): string {
    const control = this.processForm.get(controlName);
    if (control && control.touched && control.errors) {
      if (control.errors['required']) {
        return this._translocoService.translate('process.create.errors.fieldRequired');
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return this._translocoService.translate('process.create.errors.minLength', {
          length: requiredLength,
        });
      }
    }
    return '';
  }

  /**
   * Check if form control has error
   */
  hasError(controlName: string): boolean {
    const control = this.processForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
}

