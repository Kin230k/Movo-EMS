import interviewMapper from './interview.mapper';
import { Interview } from './interview.class';
import { Operation } from '../../../operation.enum';

export class InterviewService {
  static async createInterview(projectId: string): Promise<void> {
    const entity = new Interview(projectId,Operation.CREATE);
    await interviewMapper.save(entity);
  }

  static async updateInterview(interviewId: string, projectId: string): Promise<void> {
    const entity = new Interview(projectId,Operation.UPDATE, interviewId);
    await interviewMapper.save(entity);
  }

  static async getInterviewById(id: string): Promise<Interview | null> {
    return await interviewMapper.getById(id);
  }

  static async getAllInterviews(): Promise<Interview[]> {
    return await interviewMapper.getAll();
  }

  static async deleteInterview(id: string): Promise<void> {
    await interviewMapper.delete(id);
  }
}