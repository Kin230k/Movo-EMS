import { Attendance } from './attendance.class';
import attendanceMapper from './attendance.mapper';

export class AttendanceService {
  constructor() {}

  static async createAttendance(
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
    await attendanceMapper.save(entity);
  }

  static async updateAttendance(
    attendanceId: string,
    attendanceTimestamp: string,
    signedWith: any,
    signedBy: string,
    userId: string,
    areaId: string
  ): Promise<void> {
    const entity = new Attendance(
      attendanceTimestamp,
      signedWith,
      signedBy,
      userId,
      areaId,
      attendanceId
    );
    await attendanceMapper.save(entity);
  }

  static async getAttendanceById(id: string): Promise<Attendance | null> {
    return await attendanceMapper.getById(id);
  }

  static async getAllAttendances(): Promise<Attendance[]> {
    return await attendanceMapper.getAll();
  }

  static async deleteAttendance(id: string): Promise<void> {
    await attendanceMapper.delete(id);
  }
}
