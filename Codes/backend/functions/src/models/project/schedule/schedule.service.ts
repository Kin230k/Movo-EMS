import { Schedule } from './schedule.class';
import scheduleMapper from './schedule.mapper';

export class ScheduleService {
  constructor() {}

  static async createSchedule(
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
    await scheduleMapper.save(entity);
  }

  static async updateSchedule(
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
    await scheduleMapper.save(entity);
  }

  static async getScheduleById(id: string): Promise<Schedule | null> {
    return await scheduleMapper.getById(id);
  }

  static async getAllSchedules(): Promise<Schedule[]> {
    return await scheduleMapper.getAll();
  }

  static async deleteSchedule(id: string): Promise<void> {
    await scheduleMapper.delete(id);
  }
}
