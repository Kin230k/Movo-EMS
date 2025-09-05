import formMapper from './form.mapper';
import { Form } from './form.class';

export class FormService {
  constructor() {}

  static async createForm(
    projectId: string | null,
    locationId: string | null,
    formLanguage: string,
    formTitle: string
  ): Promise<void> {
    const entity = new Form(projectId, locationId, formLanguage, formTitle);
    await formMapper.save(entity);
  }

  static async updateForm(
    formId: string,
    projectId: string | null,
    locationId: string | null,
    formLanguage: string,
    formTitle: string
  ): Promise<void> {
    const entity = new Form(
      projectId,
      locationId,
      formLanguage,
      formTitle,
      formId
    );
    await formMapper.save(entity);
  }

  static async getFormById(id: string): Promise<Form | null> {
    return await formMapper.getById(id);
  }

  static async getAllForms(): Promise<Form[]> {
    return await formMapper.getAll();
  }

  static async deleteForm(id: string): Promise<void> {
    await formMapper.delete(id);
  }
  static async getFormsByLocation(locationId: string): Promise<Form[]> {
    return await formMapper.getFormsByLocation(locationId);
  }

  static async getFormsByProject(projectId: string) {
    return await formMapper.getFormsByProject(projectId);
  }
  static async getFormsByUser(userId: string): Promise<Form[]> {
    return await formMapper.getFormsByUser(userId);
  }
}
