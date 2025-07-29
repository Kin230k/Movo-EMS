import { ScheduleMapper } from '../../models/project/schedule/schedule.mapper';
import { Schedule } from '../../models/project/schedule/schedule.class';
import { Operation } from '../../models/operation.enum';

export class ScheduleService {
  constructor(private readonly mapper: ScheduleMapper) {}

  async createSchedule(
    createdAt: string, 
    startTime: string, 
    endTime: string, 
    projectId: string, 
    locationId: string
  ): Promise<void> {
    const entity = new Schedule(
      createdAt,
      startTime,
      endTime,
      projectId,
      locationId
    );
    await this.mapper.save(entity);
  }

  async updateSchedule(
    scheduleId: string, 
    createdAt: string, 
    startTime: string, 
    endTime: string, 
    projectId: string, 
    locationId: string
  ): Promise<void> {
    const entity = new Schedule(
      createdAt,
      startTime,
      endTime,
      projectId,
      locationId,
      scheduleId
    );
    await this.mapper.save(entity);
  }

  async getScheduleById(id: string): Promise<Schedule | null> {
    return await this.mapper.getById(id);
  }

  async getAllSchedules(): Promise<Schedule[]> {
    return await this.mapper.getAll();
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}