import { Routes } from '@angular/router';
import { ProcessesListComponent } from './pages/processes-list/processes-list.component';
import { ProcessCreateComponent } from './pages/process-create/process-create.component';
import { ProcessDetailComponent } from './pages/process-detail/process-detail.component';

export default [
  {
    path: '',
    component: ProcessesListComponent,
    data: {
      title: 'process.title',
    },
  },
  {
    path: 'create',
    component: ProcessCreateComponent,
    data: {
      title: 'process.create.title',
    },
  },
  {
    path: ':slug',
    component: ProcessDetailComponent,
    data: {
      title: 'process.detail.title',
    },
  },
] as Routes;

