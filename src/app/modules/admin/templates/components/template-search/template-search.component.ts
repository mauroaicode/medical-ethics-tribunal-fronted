import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-template-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslocoPipe],
  templateUrl: './template-search.component.html',
  styleUrls: ['./template-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateSearchComponent {
  private _fb = new FormBuilder();

  searchValue = input<string>('');
  onSearch = output<string>();
  onReset = output<void>();

  searchForm: FormGroup = this._fb.group({
    name: [''],
  });

  constructor() {
    // Sync form value when searchValue input changes
    effect(() => {
      const value = this.searchValue();
      if (value !== undefined && value !== null) {
        this.searchForm.patchValue({ name: value }, { emitEvent: false });
      }
    });
  }

  /**
   * Handle search
   */
  onSearchClick(): void {
    const formValue = this.searchForm.value;
    const name = formValue.name?.trim() || '';
    this.onSearch.emit(name);
  }

  /**
   * Handle search reset
   */
  onResetClick(): void {
    this.searchForm.reset();
    this.onReset.emit();
  }
}

