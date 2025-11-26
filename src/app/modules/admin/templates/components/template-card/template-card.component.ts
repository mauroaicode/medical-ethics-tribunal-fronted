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

@Component({
  selector: 'app-template-card',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './template-card.component.html',
  styleUrls: ['./template-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateCardComponent {
  template = input.required<Template>();
  onViewInDocs = output<string>();

  /**
   * Open template in Google Docs (new tab)
   */
  openTemplateInDocs(webViewLink: string | null): void {
    if (webViewLink) {
      this.onViewInDocs.emit(webViewLink);
    }
  }
}

