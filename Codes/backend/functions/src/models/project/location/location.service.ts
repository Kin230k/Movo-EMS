import { Multilingual } from '../../multilingual.type';
import locationMapper from './location.mapper';
import { Location } from './location.class';

export class LocationService {
  constructor() {}

  static async createLocation(
    name: Multilingual,
    projectId: string,
    siteMap?: string,
    longitude?: number,
    latitude?: number
  ): Promise<void> {
    const entity = new Location(
      name,
      projectId,
      undefined,
      siteMap,
      longitude,
      latitude
    );
    await locationMapper.save(entity);
  }

  static async updateLocation(
    locationId: string,
    name: Multilingual,
    projectId: string,
    siteMap?: string,
    longitude?: number,
    latitude?: number
  ): Promise<void> {
    const entity = new Location(
      name,
      projectId,
      locationId,
      siteMap,
      longitude,
      latitude
    );
    await locationMapper.save(entity);
  }

  static async getLocationById(id: string): Promise<Location | null> {
    return await locationMapper.getById(id);
  }

  static async getAllLocations(): Promise<Location[]> {
    return await locationMapper.getAll();
  }

  static async getLocationsByProject(projectId: string): Promise<Location[]> {
    return await locationMapper.getByProject(projectId);
  }

  static async deleteLocation(id: string): Promise<void> {
    await locationMapper.delete(id);
  }
}
