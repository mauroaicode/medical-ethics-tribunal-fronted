import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { ProcessService } from '@app/core/services/process/process.service';
import { DoctorService } from '@app/core/services/doctor/doctor.service';
import { Process, ProcessFilter, ProcessResponseMeta, PROCESS_STATUS_REVERSE_MAP } from '@app/core/models/process/process.model';
import { Doctor } from '@app/core/models/doctor/doctor.model';
import { DataTableComponent, DataTableColumn } from '@app/shared/components/data-table/data-table.component';
import { SearchableSelectComponent, SearchableSelectOption } from '@app/shared/components/searchable-select/searchable-select.component';
import { DateRangePickerComponent, DateRange } from '@app/shared/components/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-processes-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslocoPipe, DataTableComponent, SearchableSelectComponent, DateRangePickerComponent],
  templateUrl: './processes-list.component.html',
  styleUrls: ['./processes-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessesListComponent {
  private _processService = inject(ProcessService);
  private _doctorService = inject(DoctorService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _fb = inject(FormBuilder);

  // State
  public processes = signal<Process[]>([]);
  public loading = signal<boolean>(false);
  public pagination = signal<ProcessResponseMeta | null>(null);
  public doctors = signal<Doctor[]>([]);
  public doctorOptions = signal<SearchableSelectOption[]>([]);

  // Filter form
  public filterForm: FormGroup = this._fb.group({
    process_number: [''],
    complainant_document_number: [''],
    doctor_name: [''],
    date_range: [null as DateRange | null],
    status: [''],
  });

  // Status options for filter - using translated labels but values are keys for backend
  public statusOptions: SearchableSelectOption[] = [
    { id: 'borrador', label: PROCESS_STATUS_REVERSE_MAP['borrador'], value: 'borrador' },
    { id: 'in_progress', label: PROCESS_STATUS_REVERSE_MAP['in_progress'], value: 'in_progress' },
    { id: 'closed', label: PROCESS_STATUS_REVERSE_MAP['closed'], value: 'closed' },
  ];

  // Table columns
  public columns: DataTableColumn[] = [
    {
      key: 'process_number',
      label: 'process.table.processNumber',
      width: '150px',
      align: 'left',
      sortable: true,
    },
    {
      key: 'name',
      label: 'process.table.name',
      sortable: true,
    },
    {
      key: 'status',
      label: 'process.table.status',
      width: '150px',
      align: 'center',
    },
    {
      key: 'complainant',
      label: 'process.table.complainant',
      render: (value: any, row: Process) => {
        const name = row.complainant_name || '';
        const lastName = row.complainant_last_name || '';
        return name || lastName ? `${name} ${lastName}`.trim() : '-';
      },
    },
    {
      key: 'complainant_document_number',
      label: 'process.table.complainantDocument',
    },
    {
      key: 'doctor',
      label: 'process.table.doctor',
      render: (value: any, row: Process) => {
        const name = row.doctor_name || '';
        const lastName = row.doctor_last_name || '';
        return name || lastName ? `${name} ${lastName}`.trim() : '-';
      },
    },
    {
      key: 'start_date',
      label: 'process.table.startDate',
      width: '120px',
      align: 'center',
    },
    {
      key: 'proceedings_count',
      label: 'process.table.proceedings',
      width: '100px',
      align: 'center',
    },
  ];

  constructor() {
    this.loadDoctors();
    this._loadFiltersFromQueryParams();
    this.loadProcesses();
  }

  /**
   * Load filters from query params
   */
  private _loadFiltersFromQueryParams(): void {
    const queryParams = this._activatedRoute.snapshot.queryParams;

    // Apply query params to form
    if (queryParams['process_number']) {
      this.filterForm.patchValue({ process_number: queryParams['process_number'] });
    }
    if (queryParams['complainant_document_number']) {
      this.filterForm.patchValue({ complainant_document_number: queryParams['complainant_document_number'] });
    }
    if (queryParams['doctor_name']) {
      this.filterForm.patchValue({ doctor_name: queryParams['doctor_name'] });
    }
    // Load date range from query params
    if (queryParams['start_date_from'] || queryParams['start_date_to']) {
      const dateRange: DateRange = {
        from: queryParams['start_date_from'] || null,
        to: queryParams['start_date_to'] || null,
      };
      this.filterForm.patchValue({ date_range: dateRange });
    }
    // Backward compatibility with start_date
    if (queryParams['start_date'] && !queryParams['start_date_from'] && !queryParams['start_date_to']) {
      const dateRange: DateRange = {
        from: queryParams['start_date'],
        to: null,
      };
      this.filterForm.patchValue({ date_range: dateRange });
    }
    if (queryParams['status']) {
      this.filterForm.patchValue({ status: queryParams['status'] });
    }
  }

  /**
   * Update query params with current filters (without page parameter)
   */
  private _updateQueryParams(filters: ProcessFilter, includePage: boolean = false, page: number = 1): void {
    const queryParams: Record<string, string> = {};

    if (filters.process_number) {
      queryParams['process_number'] = filters.process_number;
    }
    if (filters.complainant_document_number) {
      queryParams['complainant_document_number'] = filters.complainant_document_number;
    }
    if (filters.doctor_name) {
      queryParams['doctor_name'] = filters.doctor_name;
    }
    if (filters.start_date_from) {
      queryParams['start_date_from'] = filters.start_date_from;
    }
    if (filters.start_date_to) {
      queryParams['start_date_to'] = filters.start_date_to;
    }
    // Backward compatibility
    if (filters.start_date && !filters.start_date_from && !filters.start_date_to) {
      queryParams['start_date'] = filters.start_date;
    }
    if (filters.status) {
      queryParams['status'] = filters.status;
    }

    if (includePage && page > 1) {
      queryParams['page'] = page.toString();
    }

    const currentParams = this._activatedRoute.snapshot.queryParams;
    const paramsToRemove: Record<string, null> = {};

    const filterParamKeys = ['process_number', 'complainant_document_number', 'doctor_name', 'start_date', 'start_date_from', 'start_date_to', 'status'];
    filterParamKeys.forEach(key => {
      if (!queryParams[key] && currentParams[key]) {
        paramsToRemove[key] = null;
      }
    });

    if (currentParams['page'] && !includePage) {
      paramsToRemove['page'] = null;
    }

    const finalParams = { ...queryParams, ...paramsToRemove };

    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: finalParams,
      replaceUrl: true,
    });
  }

  /**
   * Load active doctors
   */
  loadDoctors(): void {
    this._doctorService.getActiveDoctors().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        const options: SearchableSelectOption[] = doctors.map((doctor) => ({
          id: doctor.id,
          label: doctor.full_name,
          value: doctor.full_name,
        }));
        this.doctorOptions.set(options);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      },
    });
  }

  /**
   * Load processes with current filters
   */
  loadProcesses(page: number = 1, perPage: number = 10): void {
    this.loading.set(true);

    const formValue = this.filterForm.value;
    const dateRange: DateRange | null = formValue.date_range;

    const filters: ProcessFilter = {
      process_number: formValue.process_number?.trim() || undefined,
      complainant_document_number: formValue.complainant_document_number?.trim() || undefined,
      doctor_name: formValue.doctor_name?.trim() || undefined,
      start_date_from: dateRange?.from || undefined,
      start_date_to: dateRange?.to || undefined,
      status: formValue.status || undefined,
      page,
      per_page: perPage,
    };

    Object.keys(filters).forEach((key) => {
      const value = filters[key as keyof ProcessFilter];
      if (value === '' || value === null || value === undefined) {
        delete filters[key as keyof ProcessFilter];
      }
    });

    this._updateQueryParams(filters, false);

    this._processService.getProcesses(filters).subscribe({
      next: (response) => {

        this.processes.set(response.data);
        this.pagination.set({
          current_page: response.current_page,
          per_page: response.per_page,
          total: response.total,
          last_page: response.last_page,
          from: response.from,
          to: response.to,
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading processes:', error);
        this.loading.set(false);
      },
    });
  }

  /**
   * Handle search
   */
  onSearch(): void {
    this.loadProcesses(1, this.pagination()?.per_page || 10);
  }

  /**
   * Handle filter reset
   */
  onResetFilters(): void {
    this.filterForm.reset();

    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: {
        process_number: null,
        complainant_document_number: null,
        doctor_name: null,
        start_date: null,
        start_date_from: null,
        start_date_to: null,
        status: null,
        page: null,
      },
      replaceUrl: true,
    });
    this.loadProcesses(1, this.pagination()?.per_page || 10);
  }

  /**
   * Handle page change
   */
  onPageChange(event: { page: number; perPage: number }): void {
    this.loadProcesses(event.page, event.perPage);
  }


  /**
   * Handle row click
   */
  onRowClick(process: Process): void {

    if (!process.slug) {
      console.error('Process slug is missing:', process);

      if (process.id) {
        this._router.navigate(['/admin/processes', process.id.toString()]);
      }
      return;
    }

    this._router.navigate(['/admin/processes', process.slug]).then();
  }

  /**
   * Handle create process
   */
  onCreateProcess(): void {
    this._router.navigate(['/admin/processes/create']);
  }
}

