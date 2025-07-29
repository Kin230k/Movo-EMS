import { LocationMapper } from '../../models/project/location/location.mapper';
import { Location } from '../../models/project/location/location.class';
import { Operation } from '../../models/operation.enum';
import { Multilingual } from '../../models/multilingual.type';
export class LocationService {
  constructor(private readonly mapper: LocationMapper) {}

async createLocation(
  name: Multilingual,
  projectId: string,
  siteMap?: string,
  longitude?: number,
  latitude?: number
): Promise<void> {
  const entity = new Location(name, projectId, undefined, siteMap, longitude, latitude);
  await this.mapper.save(entity);
}

async updateLocation(
  locationId: string,
  name: Multilingual,
  projectId: string,
  siteMap?: string,
  longitude?: number,
  latitude?: number
): Promise<void> {
  const entity = new Location(name, projectId, locationId, siteMap, longitude, latitude);
  await this.mapper.save(entity);
}
  async getLocationById(id: string): Promise<Location | null> {
    return await this.mapper.getById(id);
  }

  async getAllLocations(): Promise<Location[]> {
    return await this.mapper.getAll();
  }

  async deleteLocation(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}