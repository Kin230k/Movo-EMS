import optionMapper from './option.mapper';
import { Option } from './option.class';
import { Multilingual } from '../../../multilingual.type';
import { Operation } from '../../../operation.enum';

export class OptionService {
  static async createOption(
    optionText: Multilingual,
    questionId: string,
    isCorrect: boolean,
    displayOrder: number
  ): Promise<void> {
    const entity = new Option(optionText, questionId, isCorrect, displayOrder,Operation.CREATE);
    await optionMapper.save(entity);
  }

  static async updateOption(
    optionId: string,
    optionText: Multilingual,
    questionId: string,
    isCorrect: boolean,
    displayOrder: number
  ): Promise<void> {
    const entity = new Option(optionText, questionId, isCorrect, displayOrder,Operation.UPDATE, optionId);
    await optionMapper.save(entity);
  }

  static async getOptionById(id: string): Promise<Option | null> {
    return await optionMapper.getById(id);
  }

  static async getAllOptions(): Promise<Option[]> {
    return await optionMapper.getAll();
  }

  static async deleteOption(id: string): Promise<void> {
    await optionMapper.delete(id);
  }
}