import { ActionMapper } from '../../models/auth/action/action.mapper';
import { Action } from '../../models/auth/action/action.class';
import { Operation } from '../../models/operation.enum';

export class ActionService {
  constructor(private readonly mapper: ActionMapper) {}

  async createAction(
    actionType: string
  ): Promise<void> {
    const entity = new Action(
      actionType
    );
    await this.mapper.save(entity);
  }

  async updateAction(
    actionId: string, actionType: string
  ): Promise<void> {
    const entity = new Action(
      actionType,
      actionId
    );
    await this.mapper.save(entity);
  }

  async getActionById(id: string): Promise<Action | null> {
    return await this.mapper.getById(id);
  }

  async getAllActions(): Promise<Action[]> {
    return await this.mapper.getAll();
  }

  async deleteAction(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}