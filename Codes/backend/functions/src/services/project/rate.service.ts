import { RateMapper } from '../../models/project/rate/rate.mapper';
import { Rate } from '../../models/project/rate/rate.class';

export class RateService {
  constructor(private readonly mapper: RateMapper) {}

  async createRate(
    hourlyRate: number,
    userId: string,
    projectId: string
  ): Promise<void> {
    const entity = new Rate(hourlyRate, userId, projectId);
    await this.mapper.save(entity);
  }

  async updateRate(
    rateId: string,
    hourlyRate: number,
    userId: string,
    projectId: string
  ): Promise<void> {
    const entity = new Rate(hourlyRate, userId, projectId, rateId);
    await this.mapper.save(entity);
  }

  async getRateById(id: string): Promise<Rate | null> {
    return await this.mapper.getById(id);
  }

  async getAllRates(): Promise<Rate[]> {
    return await this.mapper.getAll();
  }

  async deleteRate(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}
