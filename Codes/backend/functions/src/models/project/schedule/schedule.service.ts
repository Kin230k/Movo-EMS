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
      startTime,
      endTime,
      projectId,
      locationId,
      createdAt
    );
    await scheduleMapper.save(entity);
  }

  static async updateSchedule(
    scheduleId: string,
    startTime: string,
    endTime: string,
    projectId?: string,
    locationId?: string
  ): Promise<void> {
    const entity = new Schedule(
      startTime,
      endTime,
      projectId,
      locationId,
      undefined,
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

  static async getSchedulesByLocation(locationId: string): Promise<Schedule[]> {
    return await scheduleMapper.getByLocation(locationId);
  }

  static async getSchedulesByProjectOrLocation(
    projectId?: string,
    locationId?: string
  ): Promise<Schedule[]> {
    return await scheduleMapper.getByProjectOrLocation(projectId, locationId);
  }
}
