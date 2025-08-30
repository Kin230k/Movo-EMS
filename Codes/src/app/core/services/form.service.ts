import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DynamicFormDto } from '../../shared/types/form';

@Injectable({ providedIn: 'root' })
export class FormService {
  private readonly http = inject(HttpClient);

  // Placeholder for future real API base URL
  private readonly baseUrl = '/api/forms';

  // Mocked API call; when backend is ready, swap to real GET
  getFormById(
    formId: string,
    options?: { locationId?: string; projectId?: string }
  ): Observable<DynamicFormDto> {
    const { locationId, projectId } = options ?? {};

    // Example of how it will look with real HTTP call:
    // let params = new HttpParams();
    // if (locationId) params = params.set('locationId', locationId);
    // if (projectId) params = params.set('projectId', projectId);
    // return this.http.get<DynamicFormDto>(`${this.baseUrl}/${formId}`, { params });

    // Mocked payload (simulate network)
    const mock: DynamicFormDto = {
      formId,
      formTitle: 'Customer Feedback',
      formLanguage: 'en',
      questions: [
        {
          questionId: 'q1',
          typeCode: 'OPEN_ENDED',
          questionText: 'Tell us about your experience',
          required: true,
        },
        {
          questionId: 'q2',
          typeCode: 'SHORT_ANSWER',
          questionText: 'Your name',
          required: true,
        },
        {
          questionId: 'q3',
          typeCode: 'NUMBER',
          questionText: 'How many items did you buy?',
          required: true,
          min: 0,
          max: 100,
        },
        {
          questionId: 'q4',
          typeCode: 'RATE',
          questionText: 'Rate our service (1-5)',
          required: true,
          min: 1,
          max: 5,
        },
        {
          questionId: 'q5',
          typeCode: 'DROPDOWN',
          questionText: 'Select your city',
          options: [
            { optionId: 'c1', optionText: 'London' },
            { optionId: 'c2', optionText: 'Dubai' },
            { optionId: 'c3', optionText: 'Cairo' },
          ],
          required: true,
        },
        {
          questionId: 'q6',
          typeCode: 'RADIO',
          questionText: 'Would you recommend us?',
          options: [
            { optionId: 'y', optionText: 'Yes' },
            { optionId: 'n', optionText: 'No' },
          ],
          required: true,
        },
        {
          questionId: 'q7',
          typeCode: 'MULTIPLE_CHOICE',
          questionText: 'Which services did you use?',
          options: [
            { optionId: 's1', optionText: 'Delivery' },
            { optionId: 's2', optionText: 'Installation' },
            { optionId: 's3', optionText: 'Support' },
          ],
        },
      ],
    };

    // include query params in mock logic (no UI use, just to show it's wired)
    const annotatedMock = {
      ...mock,
      formTitle:
        locationId || projectId
          ? `${mock.formTitle} • ${locationId ? 'Loc:' + locationId : ''} ${
              projectId ? 'Proj:' + projectId : ''
            }`.trim()
          : mock.formTitle,
    } as DynamicFormDto;

    return of(annotatedMock).pipe(delay(500));
  }
}
