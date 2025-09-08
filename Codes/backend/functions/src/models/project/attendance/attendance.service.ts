import { Attendance } from './attendance.class';
import attendanceMapper,{UserAttendance} from './attendance.mapper';


export class AttendanceService {
  private constructor() {}

  // CREATE
  static async createAttendance(
    attendanceTimestamp: string,
    signedWith: 'BARCODE' | 'MANUAL',
    signedBy: string,
    userId: string,
    areaId: string
  ): Promise<void> {
    const entity = new Attendance(
      attendanceTimestamp,
      signedWith,
      signedBy,
      userId,
      areaId
    );
    await attendanceMapper.save(entity);
  }

  // UPDATE
  static async updateAttendance(
    attendanceId: string,
    attendanceTimestamp: string,
    signedWith: 'BARCODE' | 'MANUAL',
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
      attendanceId,       // required for update
    );
    await attendanceMapper.save(entity);
  }

  // GET BY ID
  static async getAttendanceById(attendanceId: string): Promise<Attendance | null> {
    return await attendanceMapper.getById(attendanceId);
  }

  // GET ALL
  static async getAllAttendances(): Promise<Attendance[]> {
    return await attendanceMapper.getAll();
  }

  // DELETE
  static async deleteAttendance(attendanceId: string): Promise<void> {
    await attendanceMapper.delete(attendanceId);
  }
  static async getAttendancesByUser(userId: string): Promise<Attendance[]> {
  return await attendanceMapper.getByUser(userId);
}

static async getAttendancesByProject(projectId: string): Promise<Attendance[]> {
  return await attendanceMapper.getByProject(projectId);
}
static async getUsersAttendanceByProject(projectId: string): Promise<UserAttendance[]> {
  return await attendanceMapper.getUserAttendancesByProject(projectId);
}

}
