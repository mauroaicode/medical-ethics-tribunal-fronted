import { Routes } from '@angular/router';
import { TemplatesListComponent } from './pages/templates-list/templates-list.component';

export default [
  {
    path: '',
    component: TemplatesListComponent,
    data: {
      title: 'templates.title',
    },
  },
] as Routes;

