import { Operation } from '../../operation.enum';
import { Multilingual } from '../../multilingual.type';
import { LocationService } from '../location/location.service';
import { Location } from '../location/location.class';

export class Area {
  constructor(
    public name: Multilingual,
    public locationId: string,
    public areaId?: string
  ) {}

  get operation(): Operation {
    return this.areaId ? Operation.UPDATE : Operation.CREATE;
  }
 
  async location(): Promise<Location | null> {
    if (!this.locationId) return null;
    return await LocationService.getLocationById(this.locationId);
  }
}