import { Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of, filter, take, map, catchError } from 'rxjs';
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
        console.log('formId', formId);
        const questionsQuery = this.apiQueries.getAllFormQuestionsQuery({
          formId,
        });
        console.log('questionsQuery', questionsQuery);
        const raw = questionsQuery?.data?.() ?? {};
        // Support multiple possible shapes from API:
        // - Array<Question>
        // - { questions: Question[] }
        // - { items: Question[] }
        // - { data: Question[] }
        console.log('raw', raw);
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as any)?.questions)
          ? (raw as any).questions
          : Array.isArray((raw as any)?.items)
          ? (raw as any).items
          : Array.isArray((raw as any)?.data)
          ? (raw as any).data
          : [];
        console.log('list', list);
        // The backend already receives formId; avoid over-filtering that can drop data
        filtered = list;
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
          options: (
            (q.options ?? q.answerOptions ?? q.choices ?? []) as any[]
          ).map((opt: any, i: number) => ({
            optionId: String(opt.optionId ?? opt.id ?? `o-${i + 1}`),
            optionText: opt.optionText ?? opt.text ?? opt.label ?? '',
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

  // Separate: fetch only form meta (title, language)
  getFormMeta(
    formId: string
  ): Observable<{ formId: string; formTitle: string; formLanguage: string }> {
    const formQuery = this.apiQueries.getFormQuery({ formId });
    return toObservable<any>(formQuery.data).pipe(
      filter((v) => v != null),
      take(1),
      map((formData) => ({
        formId: String(formId),
        formTitle:
          formData?.formTitle ?? formData?.title ?? formData?.name ?? 'Form',
        formLanguage: formData?.formLanguage ?? 'en',
      })),
      catchError(() =>
        of({ formId: String(formId), formTitle: 'Form', formLanguage: 'en' })
      )
    );
  }

  // Separate: fetch only questions (by form or interview)
  getFormQuestions(options: {
    formId?: string;
    interviewId?: string;
  }): Observable<FormQuestionDto[]> {
    const { formId, interviewId } = options;
    const query = interviewId
      ? this.apiQueries.getInterviewQuestionsQuery({ interviewId })
      : this.apiQueries.getAllFormQuestionsQuery({ formId: formId! });

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

    return toObservable<any>(query.data).pipe(
      filter((v) => v != null),
      take(1),
      map((raw) => {
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as any)?.questions)
          ? (raw as any).questions
          : Array.isArray((raw as any)?.items)
          ? (raw as any).items
          : Array.isArray((raw as any)?.data)
          ? (raw as any).data
          : [];
        return (list as any[]).map((q: any, idx: number) => ({
          questionId: String(q.questionId ?? q.id ?? `q-${idx + 1}`),
          typeCode: mapType(q.type ?? q.typeCode),
          questionText: q.text ?? q.title ?? q.questionText ?? 'Question',
          options: (
            (q.options ?? q.answerOptions ?? q.choices ?? []) as any[]
          ).map((opt: any, i: number) => ({
            optionId: String(opt.optionId ?? opt.id ?? `o-${i + 1}`),
            optionText: opt.optionText ?? opt.text ?? opt.label ?? '',
          })),
          required: !!q.required,
          min: q.min,
          max: q.max,
        }));
      }),
      catchError(() => of([]))
    );
  }
}
