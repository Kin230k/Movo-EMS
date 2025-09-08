import { Injectable } from '@angular/core';
import { DynamicFormDto, FormQuestionDto } from '../../shared/types/form';
import api from '../api/api';

@Injectable({ providedIn: 'root' })
export class FormService {
  constructor() {}

  // Load a form definition using direct API calls
  async getFormById(
    formId: string,
    options?: { locationId?: string; projectId?: string; interviewId?: string }
  ): Promise<DynamicFormDto> {
    const { locationId, projectId, interviewId } = options ?? {};

    try {
      // Load form meta
      const formData: any = await api.getForm({ formId });
      const formPayload = (formData as any)?.result ?? formData ?? {};

      // Load questions for the form or interview
      let filtered: any[] = [];
      if (interviewId) {
        const interviewData: any = await api.getInterviewQuestions({
          interviewId,
        });
        const interviewPayload =
          (interviewData as any)?.result ?? interviewData ?? {};
        filtered = Array.isArray(interviewPayload.questions)
          ? interviewPayload.questions
          : [];
      } else {
        console.log('formId', formId);
        const questionsData: any = await api.getAllFormQuestions({ formId });
        const questionsPayload =
          (questionsData as any)?.result ?? questionsData ?? {};

        const list = Array.isArray(questionsPayload)
          ? questionsPayload
          : Array.isArray((questionsPayload as any)?.questions)
          ? (questionsPayload as any).questions
          : Array.isArray((questionsPayload as any)?.items)
          ? (questionsPayload as any).items
          : Array.isArray((questionsPayload as any)?.data)
          ? (questionsPayload as any).data
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
          formPayload?.formTitle ??
          formPayload?.title ??
          formPayload?.name ??
          'Form',
        formLanguage: formPayload?.formLanguage ?? 'en',
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

      return dto;
    } catch (error) {
      console.error('Error loading form:', error);
      // Fallback empty DTO
      const empty: DynamicFormDto = {
        formId: String(formId),
        formTitle: 'Form',
        formLanguage: 'en',
        questions: [],
      };
      return empty;
    }
  }

  // Separate: fetch only form meta (title, language)
  async getFormMeta(
    formId: string
  ): Promise<{ formId: string; formTitle: string; formLanguage: string }> {
    try {
      const formData: any = await api.getForm({ formId });
      const formPayload = (formData as any)?.result ?? formData ?? {};
      return {
        formId: String(formId),
        formTitle:
          formPayload?.formTitle ??
          formPayload?.title ??
          formPayload?.name ??
          'Form',
        formLanguage: formPayload?.formLanguage ?? 'en',
      };
    } catch (error) {
      console.error('Error loading form meta:', error);
      return { formId: String(formId), formTitle: 'Form', formLanguage: 'en' };
    }
  }

  // Separate: fetch only questions (by form or interview)
  async getFormQuestions(options: {
    formId?: string;
    interviewId?: string;
  }): Promise<FormQuestionDto[]> {
    const { formId, interviewId } = options;

    try {
      let raw: any;
      if (interviewId) {
        const interviewData: any = await api.getInterviewQuestions({
          interviewId,
        });
        const interviewPayload =
          (interviewData as any)?.result ?? interviewData ?? {};
        raw = interviewPayload.questions || [];
      } else {
        const questionsData: any = await api.getAllFormQuestions({
          formId: formId!,
        });
        const questionsPayload =
          (questionsData as any)?.result ?? questionsData ?? {};
        raw = questionsPayload;
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
    } catch (error) {
      console.error('Error loading form questions:', error);
      return [];
    }
  }
}
