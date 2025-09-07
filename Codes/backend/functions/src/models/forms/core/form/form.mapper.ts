import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Form } from './form.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';
import { Question } from '../question/question.class';
// types/forms.ts (or inside form.class.ts)

export interface OptionDTO {
  optionId: string;
  optionText: string;
}

export interface QuestionDTO {
  questionId: string;
  typeCode: Question['typeCode'];
  questionText: string;
  options: OptionDTO[]; // empty array when no options
}

export interface FormWithQuestions {
  formId: string;
  formTitle: string;
  formLanguage: string;
  questions: QuestionDTO[]; // empty array when no questions
}

export class FormMapper extends BaseMapper<Form> {
  async save(entity: Form): Promise<void> {
    const currentUserId = CurrentUser.uuid;

    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { formId, projectId, locationId, formLanguage, formTitle } = entity;

    if (op === Operation.UPDATE) {
      if (!formId) throw new Error('Form ID is required for update');
      await pool.query('CALL update_form($1, $2, $3, $4, $5, $6)', [
        currentUserId,
        formId,
        projectId,
        locationId,
        formLanguage,
        formTitle,
      ]);
    } else {
      await pool.query('CALL create_form($1, $2, $3, $4, $5)', [
        currentUserId,
        projectId,
        locationId,
        formLanguage,
        formTitle,
      ]);
    }
  }

  async getById(id: string): Promise<Form | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Form ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_form_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToForm(result.rows[0]) : null;
  }

  async getAll(): Promise<Form[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_forms($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToForm);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Form ID is required');

    await pool.query('CALL delete_form($1, $2)', [currentUserId, id]);
  }
  async getFormsByLocation(locationId: string): Promise<Form[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!locationId) throw new Error('Location ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_forms_by_location($1, $2)',
      [currentUserId, locationId]
    );

    return result.rows.map(this.mapRowToForm);
  }
  async getFormsByProject(projectId: string) {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!projectId) throw new Error('Project ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_forms_by_project($1, $2)',
      [currentUserId, projectId]
    );
    // convert them  formId UUID,
    // projectId UUID,
    // locationId UUID,
    // projectName JSONB,
    // locationName JSONB,
    // form_language TEXT,
    // form_title TEXT
    const forms = result.rows.map((row) => ({
      formId: row.formid,
      formTitle: row.form_title,
      projectId: row.projectid,
      locationId: row.locationid,
      projectName: row.projectname,
      locationName: row.locationname,
    }));

    return forms;
  }
  async getFormsByUser(userId: string): Promise<Form[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!userId) throw new Error('Project ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_forms_by_user($1, $2)',
      [currentUserId, userId]
    );

    return result.rows.map(this.mapRowToForm);
  }

  async getFormsByClient(clientId: string) {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!clientId) throw new Error('Client ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_forms_by_client($1, $2)',
      [currentUserId, clientId]
    );

    // Convert to the expected format matching the SQL function return
    const forms = result.rows.map((row) => ({
      formId: row.formid,
      formTitle: row.form_title,
      formLanguage: row.form_language,
      projectId: row.projectid,
      locationId: row.locationid,
      projectName: row.projectname,
      locationName: row.locationname,
      clientName: row.clientname,
    }));

    return forms;
  }

  private mapRowToForm = (row: any): Form => {
    return new Form(
      row.projectid,
      row.locationid,
      row.form_language,
      row.form_title,
      row.formid
    );
  };
}

const formMapper = new FormMapper();
export default formMapper;
