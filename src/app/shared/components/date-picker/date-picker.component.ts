import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  signal,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private _elementRef = inject(ElementRef);

  // Inputs
  public label = input<string | undefined>(undefined);
  public placeholder = input<string>('Seleccionar fecha');
  public size = input<'xs' | 'sm' | 'md' | 'lg'>('sm');
  public disabled = input<boolean>(false);

  // Internal state
  public isOpen = signal<boolean>(false);
  public selectedDate = model<string | null>(null);
  public displayDate = signal<string>('');
  public isDisabled = signal<boolean>(false);

  // Calendar state
  public currentMonth = signal<number>(new Date().getMonth());
  public currentYear = signal<number>(new Date().getFullYear());
  public selectedDay = signal<number | null>(null);

  // ControlValueAccessor methods
  private _onChange: (value: any) => void = () => {};
  private _onTouched: () => void = () => {};

  /**
   * Handle blur event
   */
  onBlur(): void {
    this._onTouched();
  }

  constructor() {
    document.addEventListener('click', this._onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this._onDocumentClick.bind(this));
  }

  ngOnInit(): void {
    if (!this.selectedDate()) {
      const today = new Date();
      this.currentMonth.set(today.getMonth());
      this.currentYear.set(today.getFullYear());
    }
  }

  /**
   * Write value from form to component
   */
  writeValue(value: any): void {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        this.selectedDate.set(value);
        this._updateDisplayDate(date);
        this.currentMonth.set(date.getMonth());
        this.currentYear.set(date.getFullYear());
        this.selectedDay.set(date.getDate());
      }
    } else {
      this.selectedDate.set(null);
      this.displayDate.set('');
      this.selectedDay.set(null);
    }
  }

  /**
   * Register onChange function
   */
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  /**
   * Register onTouched function
   */
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  /**
   * Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  /**
   * Toggle dropdown visibility
   */
  toggleDropdown(): void {
    if (this.disabled() || this.isDisabled()) return;
    this.isOpen.update((value) => !value);
    if (this.isOpen()) {
      const date = this.selectedDate() ? new Date(this.selectedDate()!) : new Date();
      this.currentMonth.set(date.getMonth());
      this.currentYear.set(date.getFullYear());
    }
  }

  /**
   * Get days in month
   */
  getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Get first day of month (0 = Sunday, 1 = Monday, etc.)
   */
  getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  /**
   * Get calendar days
   */
  getCalendarDays(): (number | null)[] {
    const days: (number | null)[] = [];
    const month = this.currentMonth();
    const year = this.currentYear();
    const firstDay = this.getFirstDayOfMonth(month, year);
    const daysInMonth = this.getDaysInMonth(month, year);

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }

  /**
   * Get month name
   */
  getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
  }

  /**
   * Select a day
   */
  selectDay(day: number | null): void {
    if (day === null) return;

    const month = this.currentMonth();
    const year = this.currentYear();
    const date = new Date(year, month, day);
    const formattedDate = this._formatDate(date);

    this.selectedDate.set(formattedDate);
    this.selectedDay.set(day);
    this._updateDisplayDate(date);
    this._onChange(formattedDate);
    this._onTouched();
    this.isOpen.set(false);
  }

  /**
   * Go to previous month
   */
  previousMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update((year) => year - 1);
    } else {
      this.currentMonth.update((month) => month - 1);
    }
  }

  /**
   * Go to next month
   */
  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update((year) => year + 1);
    } else {
      this.currentMonth.update((month) => month + 1);
    }
  }

  /**
   * Go to previous year
   */
  previousYear(): void {
    this.currentYear.update((year) => year - 1);
  }

  /**
   * Go to next year
   */
  nextYear(): void {
    this.currentYear.update((year) => year + 1);
  }

  /**
   * Check if day is selected
   */
  isSelectedDay(day: number | null): boolean {
    if (day === null) return false;
    return this.selectedDay() === day &&
           this.currentMonth() === (this.selectedDate() ? new Date(this.selectedDate()!).getMonth() : -1) &&
           this.currentYear() === (this.selectedDate() ? new Date(this.selectedDate()!).getFullYear() : -1);
  }

  /**
   * Check if day is today
   */
  isToday(day: number | null): boolean {
    if (day === null) return false;
    const today = new Date();
    return day === today.getDate() &&
           this.currentMonth() === today.getMonth() &&
           this.currentYear() === today.getFullYear();
  }

  /**
   * Clear selection
   */
  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selectedDate.set(null);
    this.displayDate.set('');
    this.selectedDay.set(null);
    this._onChange(null);
    this._onTouched();
    this.isOpen.set(false);
  }

  /**
   * Format date for display
   */
  private _updateDisplayDate(date: Date): void {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    this.displayDate.set(`${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`);
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private _formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Handle document click to close dropdown
   */
  private _onDocumentClick(event: MouseEvent): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}

