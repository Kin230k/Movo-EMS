import optionMapper from './option.mapper';
import { Option } from './option.class';

export class OptionService {
  static async createOption(
    optionText: string,  // Changed from Multilingual to string
    questionId: string,
    isCorrect: boolean,
    displayOrder: number
  ): Promise<void> {
    const entity = new Option(optionText, questionId, isCorrect, displayOrder);
    await optionMapper.save(entity);
  }

  static async updateOption(
    optionId: string,
    optionText: string,  // Changed from Multilingual to string
    questionId: string,
    isCorrect: boolean,
    displayOrder: number
  ): Promise<void> {
    const entity = new Option(optionText, questionId, isCorrect, displayOrder, optionId);
    await optionMapper.save(entity);
  }

  static async getOptionById(id: string): Promise<Option | null> {
    return await optionMapper.getById(id);
  }
  static async  getOptionsByQuestion(questionId: string): Promise<Option[] | null> {
    return await optionMapper.getByQuestion(questionId);
  }

  static async getAllOptions(): Promise<Option[]> {
    return await optionMapper.getAll();
  }

  static async deleteOption(id: string): Promise<void> {
    await optionMapper.delete(id);
  }
}