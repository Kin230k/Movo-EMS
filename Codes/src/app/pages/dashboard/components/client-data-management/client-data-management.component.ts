import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
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
  clients: any[] = [];
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
    this.clients = [];

    try {
      const clients = await this.fetchClients();
      this.clients = clients;
      this._isFinished = true;
    } catch (err) {
      this._error = err;
      this.clients = [];
    } finally {
      this._isLoading = false;
    }
  }

  async fetchClients(): Promise<any[]> {
    await new Promise((r) => setTimeout(r, 900));
    return (this.clients = Array.from({ length: 10 }).map((_, i) => ({
      clientId: i + 1,
      name: { en: `Client A${i + 1}`, ar: `عميل A${i + 1}` },
      phone: '0987654321',
      email: `clientA${i + 1}@example.com`,
      picture: '/assets/images/image.png',
      logo: '/assets/images/image.png',
      company: { en: `Client A${i + 1}`, ar: `عميل A${i + 1}` },
    })));
  }

  onClientCreated(payload: {
    name: { en: string; ar: string };
    contactEmail: string;
    contactPhone: string;
    password: string;
    logo?: string;
    company?: { en: string; ar: string } | null;
  }) {
    const newClient = {
      clientId: Date.now(),
      name: payload.name,
      phone: payload.contactPhone,
      email: payload.contactEmail,
      picture: payload.logo || '/assets/images/image.png',
      logo: payload.logo || '/assets/images/image.png',
      company: payload.company ?? null,
      isPresent: true,
    };
    this.clients = [newClient, ...this.clients];
  }
}
