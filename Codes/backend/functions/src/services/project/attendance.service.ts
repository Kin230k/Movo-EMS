import { AttendanceMapper } from '../../models/project/attendance/attendance.mapper';
import { Attendance } from '../../models/project/attendance/attendance.class';

export class AttendanceService {
  constructor(private readonly mapper: AttendanceMapper) {}

  async createAttendance(
    date: string,
    time: string,
    signedWith: any,
    signedBy: string,
    userId: string,
    areaId: string
  ): Promise<void> {
    const entity = new Attendance(
      date,
      time,
      signedWith,
      signedBy,
      userId,
      areaId
    );
    await this.mapper.save(entity);
  }

  async updateAttendance(
    attendanceId: string,
    date: string,
    time: string,
    signedWith: any,
    signedBy: string,
    userId: string,
    areaId: string
  ): Promise<void> {
    const entity = new Attendance(
      date,
      time,
      signedWith,
      signedBy,
      userId,
      areaId,
      attendanceId
    );
    await this.mapper.save(entity);
  }

  async getAttendanceById(id: string): Promise<Attendance | null> {
    return await this.mapper.getById(id);
  }

  async getAllAttendances(): Promise<Attendance[]> {
    return await this.mapper.getAll();
  }

  async deleteAttendance(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}
