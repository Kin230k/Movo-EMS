import formMapper from './form.mapper';
import { Form } from './form.class';
import { Operation } from '../../../operation.enum';

export class FormService {
  static async createForm(projectId: string | null, locationId: string | null): Promise<void> {
    const entity = new Form(projectId, locationId,Operation.CREATE);
    await formMapper.save(entity);
  }

  static async updateForm(formId: string, projectId: string | null, locationId: string | null): Promise<void> {
    const entity = new Form(projectId, locationId,Operation.UPDATE, formId);
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