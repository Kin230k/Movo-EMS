import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DynamicFormDto, FormQuestionDto } from '../../shared/types/form';
import { ApiQueriesService } from './queries.service';

@Injectable({ providedIn: 'root' })
export class FormService {
  constructor(private apiQueries: ApiQueriesService) {}

  // Load a form definition via ApiQueriesService
  getFormById(
    formId: string,
    options?: { locationId?: string; projectId?: string; interviewId?: string }
  ): Observable<DynamicFormDto> {
    const { locationId, projectId, interviewId } = options ?? {};

    try {
      // Load form meta
      const formQuery = this.apiQueries.getFormQuery({ formId });
      const formData = formQuery?.data?.();

      // Load questions for the form or interview
      let filtered: any[] = [];
      if (interviewId) {
        const iq = this.apiQueries.getInterviewQuestionsQuery({ interviewId });
        const data = iq?.data?.() ?? [];
        filtered = Array.isArray(data) ? data : [];
      } else {
        const questionsQuery = this.apiQueries.getAllQuestionsQuery();
        const allQuestions = questionsQuery?.data?.() ?? [];
        filtered = Array.isArray(allQuestions)
          ? allQuestions.filter(
              (q: any) => String(q.formId ?? '') === String(formId)
            )
          : [];
      }

      const mapType = (t: any): FormQuestionDto['typeCode'] => {
        const up = String(t || '').toUpperCase();
        const allowed = [
          'OPEN_ENDED',
          'SHORT_ANSWER',
          'NUMBER',
          'RATE',
          'DROPDOWN',
          'RADIO',
          'MULTIPLE_CHOICE',
        ];
        return (allowed as string[]).includes(up)
          ? (up as FormQuestionDto['typeCode'])
          : 'OPEN_ENDED';
      };

      const dto: DynamicFormDto = {
        formId: String(formId),
        formTitle:
          formData?.formTitle ?? formData?.title ?? formData?.name ?? 'Form',
        formLanguage: formData?.formLanguage ?? 'en',
        questions: filtered.map((q: any, idx: number) => ({
          questionId: String(q.questionId ?? q.id ?? `q-${idx + 1}`),
          typeCode: mapType(q.type ?? q.typeCode),
          questionText: q.text ?? q.title ?? q.questionText ?? 'Question',
          options: (q.options || []).map((opt: any, i: number) => ({
            optionId: String(opt.optionId ?? opt.id ?? `o-${i + 1}`),
            optionText: opt.optionText ?? opt.text ?? '',
          })),
          required: !!q.required,
          min: q.min,
          max: q.max,
        })),
      };

      // annotate meta if needed
      if (locationId || projectId) {
        dto.formTitle = `${dto.formTitle}`;
      }

      return of(dto);
    } catch {
      // Fallback empty DTO
      const empty: DynamicFormDto = {
        formId: String(formId),
        formTitle: 'Form',
        formLanguage: 'en',
        questions: [],
      };
      return of(empty);
    }
  }
}
