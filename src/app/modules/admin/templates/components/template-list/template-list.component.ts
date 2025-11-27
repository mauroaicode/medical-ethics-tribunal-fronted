import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { Template } from '@app/core/models/template/template.model';
import { TemplateCardComponent } from '../template-card/template-card.component';
import { TemplateSearchComponent } from '../template-search/template-search.component';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, TemplateCardComponent, TemplateSearchComponent],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateListComponent {
  templates = input.required<Template[]>();
  loading = input<boolean>(false);
  searchValue = input<string>('');
  selectable = input<boolean>(false);
  selectedTemplateId = input<number | null>(null);

  onSearch = output<string>();
  onResetSearch = output<void>();
  onViewInDocs = output<string>();
  onSelect = output<Template>();

  /**
   * Handle search
   */
  handleSearch(name: string): void {
    this.onSearch.emit(name);
  }

  /**
   * Handle search reset
   */
  handleResetSearch(): void {
    this.onResetSearch.emit();
  }

  /**
   * Handle view in docs
   */
  handleViewInDocs(webViewLink: string): void {
    this.onViewInDocs.emit(webViewLink);
  }

  /**
   * Handle template selection
   */
  handleSelect(template: Template): void {
    if (this.selectable()) {
      this.onSelect.emit(template);
    }
  }
}

