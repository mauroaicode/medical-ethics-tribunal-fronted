import { Routes } from '@angular/router';
import { ProcessesListComponent } from './pages/processes-list/processes-list.component';

export default [
  {
    path: '',
    component: ProcessesListComponent,
    data: {
      title: 'process.title',
    },
  },
] as Routes;

