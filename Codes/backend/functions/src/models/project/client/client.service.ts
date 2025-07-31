import  clientMapper  from '../../models/project/client/client.mapper';
import { Client } from '../../models/project/client/client.class';
import { Multilingual } from '../../models/multilingual.type';
export class ClientService {
  constructor() {}

 static async createClient(
    name: Multilingual,
    contactEmail: string,
    contactPhone: string,
    logo?: string,
    company?: Multilingual | null
  ): Promise<void> {
    const entity = new Client(
      name,
      contactEmail,
      contactPhone,
      undefined,
      logo,
      company
    );
    await clientMapper.save(entity);
  }

 static async updateClient(
    clientId: string,
    name: Multilingual,
    contactEmail: string,
    contactPhone: string,
    logo?: string,
    company?: Multilingual | null
  ): Promise<void> {
    const entity = new Client(
      name,
      contactEmail,
      contactPhone,
      clientId,
      logo,
      company
    );
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
