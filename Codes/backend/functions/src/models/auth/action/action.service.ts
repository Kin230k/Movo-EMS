import actionMapper from './action.mapper';
import { Action } from './action.class';

export class ActionService {
  constructor() {}

  static async createAction(actionType: string): Promise<void> {
    const entity = new Action(actionType);
    await actionMapper.save(entity);
  }

  static async updateAction(
    actionId: string,
    actionType: string
  ): Promise<void> {
    const entity = new Action(actionType, actionId);
    await actionMapper.save(entity);
  }

  static async getActionById(id: string): Promise<Action | null> {
    return await actionMapper.getById(id);
  }

  static async getAllActions(): Promise<Action[]> {
    return await actionMapper.getAll();
  }

  static async deleteAction(id: string): Promise<void> {
    await actionMapper.delete(id);
  }
}
