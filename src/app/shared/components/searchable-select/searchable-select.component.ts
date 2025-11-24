import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  HostListener,
  input,
  output,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SearchableSelectOption {
  id: number | string;
  label: string;
  value: any;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchable-select.component.html',
  styleUrls: ['./searchable-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true,
    },
  ],
})
export class SearchableSelectComponent implements ControlValueAccessor {
  // Inputs
  public options = input.required<SearchableSelectOption[]>();
  public placeholder = input<string>('Seleccionar...');
  public label = input<string>('');
  public disabled = input<boolean>(false);
  public size = input<'xs' | 'sm' | 'md' | 'lg'>('sm');

  // Outputs
  public valueChange = output<any>();

  // ViewChild for dropdown element
  @ViewChild('dropdownContainer', { static: false }) dropdownContainer!: ElementRef;

  // Internal state
  public isOpen = signal<boolean>(false);
  public searchTerm = signal<string>('');
  public selectedValue = signal<any>(null);
  public selectedLabel = signal<string>('');

  // Filtered options based on search
  public filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const opts = this.options();

    if (!term) {
      return opts;
    }

    return opts.filter((option) =>
      option.label.toLowerCase().includes(term)
    );
  });

  // ControlValueAccessor implementation
  private _onChange = (value: any) => {};
  private _onTouched = () => {};

  constructor() {
    // Close dropdown when clicking outside
    effect(() => {
      if (this.isOpen()) {
        // This will be handled by the click outside directive or manual handling
      }
    });
  }

  /**
   * Toggle dropdown
   */
  toggleDropdown(): void {
    if (this.disabled()) return;
    this.isOpen.update((value) => !value);
    if (!this.isOpen()) {
      this.searchTerm.set('');
    }
  }

  /**
   * Close dropdown
   */
  closeDropdown(): void {
    this.isOpen.set(false);
    this.searchTerm.set('');
  }

  /**
   * Select an option
   */
  selectOption(option: SearchableSelectOption): void {
    this.selectedValue.set(option.value);
    this.selectedLabel.set(option.label);
    this._onChange(option.value);
    this.valueChange.emit(option.value);
    this.closeDropdown();
  }

  /**
   * Clear selection
   */
  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selectedValue.set(null);
    this.selectedLabel.set('');
    this._onChange(null);
    this.valueChange.emit(null);
  }

  /**
   * Handle search input
   */
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  /**
   * ControlValueAccessor: Write value
   */
  writeValue(value: any): void {
    if (value === null || value === undefined) {
      this.selectedValue.set(null);
      this.selectedLabel.set('');
      return;
    }

    const option = this.options().find((opt) => opt.value === value);
    if (option) {
      this.selectedValue.set(option.value);
      this.selectedLabel.set(option.label);
    } else {
      this.selectedValue.set(value);
      this.selectedLabel.set('');
    }
  }

  /**
   * ControlValueAccessor: Register onChange
   */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /**
   * ControlValueAccessor: Register onTouched
   */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /**
   * ControlValueAccessor: Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    // Handled by input signal
  }

  /**
   * Handle blur event
   */
  onBlur(): void {
    this._onTouched();
  }

  /**
   * Handle click outside to close dropdown
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.isOpen() && this.dropdownContainer) {
      const target = event.target as HTMLElement;
      if (!this.dropdownContainer.nativeElement.contains(target)) {
        this.closeDropdown();
      }
    }
  }
}

