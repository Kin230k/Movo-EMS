import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import api from '../../../../core/api/api';
import { CardListComponent } from '../../../../components/shared/card-list/card-list.component';
import { CardListSkeletionComponent } from '../../../../components/shared/card-list-skeletion/card-list-skeletion.component';
import { ClientTopbarComponent } from './topbar/topbar.component';
import { ClientProfileCardComponent } from './profile-card/client-profile-card.component';

@Component({
  selector: 'app-client-data-management',
  imports: [
    CommonModule,
    TranslateModule,
    CardListComponent,
    CardListSkeletionComponent,
    ClientTopbarComponent,
  ],
  templateUrl: './client-data-management.component.html',
  styleUrl: './client-data-management.component.scss',
})
export class ClientDataManagementComponent {
  constructor() {}

  private _clients: any[] = [];

  get clients() {
    return this._clients;
  }
  profileCardComponent = ClientProfileCardComponent;

  private _isLoading = false;
  private _error: any = null;
  private _isFinished = false;

  get isLoading() {
    return this._isLoading;
  }
  get error(): any {
    return this._error;
  }
  get isFinished() {
    return this._isFinished;
  }
  async ngOnInit() {
    await this.onClientSelected();
  }
  async onClientSelected() {
    this._isLoading = true;
    this._error = null;
    this._isFinished = false;
    this._clients = [];

    try {
      const data: any = await api.getAllClients();
      const payload = (data as any)?.result ?? data ?? [];
      this._clients = Array.isArray(payload)
        ? payload.map((c: any, idx: number) => ({
            clientId: c.clientId ?? c.id ?? idx + 1,
            name: c.name,
            phone: c.contactPhone ?? c.phone ?? '',
            email: c.contactEmail ?? c.email ?? '',
            picture: c.logo ?? '/assets/images/image.png',
            logo: c.logo ?? '/assets/images/image.png',
            company: c.company ?? null,
          }))
        : [];
      this._isFinished = true;
    } catch (err) {
      this._error = err;
      this._clients = [];
    } finally {
      this._isLoading = false;
    }
  }

  async onClientCreated(payload: {
    name: { en: string; ar: string };
    contactEmail: string;
    contactPhone: string;
    password: string;
    logo?: string;
    company?: { en: string; ar: string } | null;
  }) {
    try {
      await api.adminCreateClient(payload as any);
      // Refresh the client list after creation
      await this.onClientSelected();
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error creating client. Please try again.');
    }
  }

  // Refetch methods for modals
  async refetchClients(): Promise<void> {
    await this.onClientSelected();
  }
}
