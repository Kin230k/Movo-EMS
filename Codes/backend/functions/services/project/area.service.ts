import { AreaMapper } from '../../models/project/area/area.mapper';
import { Area } from '../../models/project/area/area.class';
import { Operation } from '../../models/operation.enum';
import { Multilingual } from '../../models/multilingual.type';

export class AreaService {
  constructor(private readonly mapper: AreaMapper) {}

async createArea(
  name: Multilingual,
  locationId: string
): Promise<void> {
  const entity = new Area(name, locationId);
  await this.mapper.save(entity);
}

async updateArea(
  areaId: string,
  name: Multilingual,
  locationId: string
): Promise<void> {
  const entity = new Area(name, locationId, areaId);
  await this.mapper.save(entity);
}
  async getAreaById(id: string): Promise<Area | null> {
    return await this.mapper.getById(id);
  }

  async getAllAreas(): Promise<Area[]> {
    return await this.mapper.getAll();
  }

  async deleteArea(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}