import { Multilingual } from '../../multilingual.type';
import areaMapper from './area.mapper';
import { Area } from './area.class';

export class AreaService {
  constructor() {}

  static async createArea(
    name: Multilingual,
    locationId: string
  ): Promise<void> {
    const entity = new Area(name, locationId);
    await areaMapper.save(entity);
  }

  static async updateArea(
    areaId: string,
    name: Multilingual,
    locationId: string
  ): Promise<void> {
    const entity = new Area(name, locationId, areaId);
    await areaMapper.save(entity);
  }
  static async getAreaById(id: string): Promise<Area | null> {
    return await areaMapper.getById(id);
  }

  static async getAllAreas(): Promise<Area[]> {
    return await areaMapper.getAll();
  }
  static async getAreasByLocation(locationId: string): Promise<Area[]> {
    return await areaMapper.getByLocation(locationId);
  }
  static async deleteArea(id: string): Promise<void> {
    await areaMapper.delete(id);
  }
}
