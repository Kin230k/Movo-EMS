import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

/* shared types */
export type LocalizedString = { en: string; ar: string };

export interface LocationSummary {
  locationId: string;
  name?: LocalizedString | string;
  formId?: string | null;
}

export interface ProjectSummary {
  projectId: string;
  name: LocalizedString | string;
  description?: LocalizedString | string | null;
  startingDate?: string | null; // ISO date
  endingDate?: string | null; // ISO date
  formId?: string | null;
  locations?: LocationSummary[] | null;
}

@Injectable({ providedIn: 'root' })
export class MockProjectsService {
  private mockProjects: ProjectSummary[] = [
    {
      projectId: 'proj-direct-1',
      name: { en: 'Direct Form Project', ar: 'مشروع بنموذج مباشر' },
      description: {
        en: 'This project links directly to a form',
        ar: 'هذا المشروع مرتبط بنموذج مباشر',
      },
      startingDate: '2025-01-01',
      endingDate: '2025-12-31',
      formId: 'form-1111-aaaa-2222',
    },
    {
      projectId: 'proj-locations-1',
      name: { en: 'Location Based Project', ar: 'مشروع مرتبط بالمواقع' },
      description: {
        en: 'This project has locations each with its own form',
        ar: 'هذا المشروع له مواقع ولكل موقع نموذج',
      },
      startingDate: '2025-02-15',
      locations: [
        {
          locationId: 'loc-100',
          name: { en: 'Site A', ar: 'الموقع أ' },
          formId: 'form-2222-bbbb-3333',
        },
        {
          locationId: 'loc-101',
          name: { en: 'Site B', ar: 'الموقع ب' },
          formId: null,
        },
      ],
    },
    {
      projectId: 'proj-noform-1',
      name: { en: 'No Form Project', ar: 'مشروع بدون نموذج' },
      description: {
        en: 'A project without any configured form',
        ar: 'مشروع بدون نموذج',
      },
      startingDate: '2025-03-01',
    },
  ];

  private latencyMs = 350;

  getProjects(): Observable<ProjectSummary[]> {
    return of(this.mockProjects).pipe(delay(this.latencyMs));
  }

  getProjectById(projectId: string): Observable<ProjectSummary | null> {
    const found =
      this.mockProjects.find((p) => p.projectId === projectId) || null;
    const clone = found ? JSON.parse(JSON.stringify(found)) : null;
    return of(clone).pipe(delay(this.latencyMs));
  }
}
