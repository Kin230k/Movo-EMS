import { Rate } from './rate.class';
import rateMapper from './rate.mapper';

export class RateService {
  constructor() {}

  static async createRate(
    hourlyRate: number,
    userId: string,
    projectId: string
  ): Promise<void> {
    const entity = new Rate(hourlyRate, userId, projectId);
    await rateMapper.save(entity);
  }

  static async updateRate(
    rateId: string,
    hourlyRate: number,
    userId: string,
    projectId: string
  ): Promise<void> {
    const entity = new Rate(hourlyRate, userId, projectId, rateId);
    await rateMapper.save(entity);
  }

  static async getRateById(id: string): Promise<Rate | null> {
    return await rateMapper.getById(id);
  }

  static async getAllRates(): Promise<Rate[]> {
    return await rateMapper.getAll();
  }

  static async deleteRate(id: string): Promise<void> {
    await rateMapper.delete(id);
  }
}
