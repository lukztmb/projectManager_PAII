import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group">
      <div>
        <h3 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {{ task().title }}
        </h3>
        
        <div class="mt-4 flex flex-col gap-2.5 text-sm text-slate-500">
          <div class="flex items-center">
            <span class="font-semibold text-slate-700 mr-2">Estimación:</span>
            <span>{{ task().estimatedHours }} hrs</span>
          </div>
          
          <div class="flex items-center">
            <span class="font-semibold text-slate-700 mr-2">Asignado a:</span>
            <span [class.italic]="!task().assignee" [class.text-slate-400]="!task().assignee">
              {{ task().assignee || 'Sin asignar' }}
            </span>
          </div>
        </div>
      </div>

      @if (detailsUrl()) {
        <div class="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <a
            [routerLink]="detailsUrl()"
            class="text-indigo-650 hover:text-indigo-800 text-sm font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Ver detalle</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      }
    </article>
  `
})
export class TaskCardComponent {
  // Required signal input. The component will fail to compile if the parent does not provide a [task]
  public readonly task = input.required<Task>();

  // Optional signal input for the navigation URL details
  public readonly detailsUrl = input<any[] | string | null>(null);
}