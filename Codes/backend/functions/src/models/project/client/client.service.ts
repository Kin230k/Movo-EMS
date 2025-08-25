import { Multilingual } from '../../multilingual.type';
import { Client } from './client.class';
import clientMapper from './client.mapper';
import { ClientStatus } from '../../client_status.enum';
import { Operation } from '../../operation.enum';

export class ClientService {
  constructor() {}

  static async createClient(
    name: Multilingual,
    contactEmail: string,
    contactPhone: string,
    company: Multilingual,
    clientId: string,
    logo?: string,
    status: ClientStatus = ClientStatus.Pending
  ): Promise<void> {
    const entity = new Client(
      name,
      contactEmail,
      contactPhone,
      company,
      clientId,
      logo,
      status
    );
    await clientMapper.save(entity);
  }

  static async updateClient(
    clientId: string,
    name: Multilingual,
    contactEmail: string,
    company: Multilingual,
    contactPhone: string,
    logo?: string,
    status: ClientStatus = ClientStatus.Pending
  ): Promise<void> {
    const entity = new Client(
      name,
      contactEmail,
      contactPhone,
      company,
      clientId,
      logo,
      status
    );
    entity.operation = Operation.UPDATE;
    await clientMapper.save(entity);
  }

  static async getClientById(id: string): Promise<Client | null> {
    return await clientMapper.getById(id);
  }

  static async getAllClients(): Promise<Client[]> {
    return await clientMapper.getAll();
  }

  static async deleteClient(id: string): Promise<void> {
    await clientMapper.delete(id);
  }
}
