import { ClientMapper } from '../../models/project/client/client.mapper';
import { Client } from '../../models/project/client/client.class';
import { Operation } from '../../models/operation.enum';

export class ClientService {
  constructor(private readonly mapper: ClientMapper) {}

  async createClient(
    name: string,
    contactEmail: string,
    contactPhone: string,
    logo?: string,
    company?: string
  ): Promise<void> {
    const entity = new Client(
      name,
      contactEmail,
      contactPhone,
      undefined,
      logo,
      company
    );
    await this.mapper.save(entity);
  }

  async updateClient(
    clientId: string,
    name: string,
    contactEmail: string,
    contactPhone: string,
    logo?: string,
    company?: string
  ): Promise<void> {
    const entity = new Client(
      name,
      contactEmail,
      contactPhone,
      clientId,
      logo,
      company
    );
    await this.mapper.save(entity);
  }

  async getClientById(id: string): Promise<Client | null> {
    return await this.mapper.getById(id);
  }

  async getAllClients(): Promise<Client[]> {
    return await this.mapper.getAll();
  }

  async deleteClient(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}