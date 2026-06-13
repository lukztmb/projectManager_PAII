import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/feature/login/login.component').then(m => m.LoginComponent) 
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { 
        path: '', 
        redirectTo: 'projects', 
        pathMatch: 'full' 
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/feature/project-list/project-list.component').then(m => m.ProjectListComponent)
      },
      { 
        path: 'projects/create',  
        loadComponent: () => import('./features/projects/feature/project-create/project-create.component').then(m => m.ProjectCreateComponent)
      },
      {
        path: 'projects/:projectId',
        loadComponent: () => import('./features/projects/feature/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
      },
      {
        path: 'projects/:projectId/tasks/in-progress',
        loadComponent: () => import('./features/tasks/feature/task-list/task-list.component').then(m => m.TaskListComponent)
      },
      { 
        path: 'tasks/in-progress', 
        loadComponent: () => import('./features/tasks/feature/task-list/task-list.component').then(m => m.TaskListComponent) 
      },
      { 
        path: 'projects/:projectId/tasks/create', 
        loadComponent: () => import('./features/tasks/feature/task-create/task-create.component').then(m => m.TaskCreateComponent)
      },  
      { 
        path: 'projects/:projectId/tasks/:taskId', 
        loadComponent: () => import('./features/tasks/feature/task-detail/task-detail.component').then(m => m.TaskDetailComponent)
      }
    ]
  },
  { 
    path: '**', 
    redirectTo: 'projects' 
  }
];