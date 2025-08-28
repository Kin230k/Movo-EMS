import formMapper from './form.mapper';
import { Form } from './form.class';


export class FormService {
  constructor() {}

  static async createForm(
    projectId: string | null,
    locationId: string | null
  ): Promise<void> {
    const entity = new Form(projectId, locationId);
    await formMapper.save(entity);
  }

  static async updateForm(
    formId: string,
    projectId: string | null,
    locationId: string | null
  ): Promise<void> {
    const entity = new Form(projectId, locationId, formId);
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
}
