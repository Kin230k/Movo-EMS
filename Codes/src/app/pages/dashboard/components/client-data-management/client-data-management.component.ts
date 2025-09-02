import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ApiQueriesService } from '../../../../core/services/queries.service';
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
  constructor(private apiQueries: ApiQueriesService) {}

  clientsQuery: any;
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
    this.clientsQuery = this.apiQueries.getAllClientsQuery();
    await this.onClientSelected();
  }
  async onClientSelected() {
    this._isLoading = true;
    this._error = null;
    this._isFinished = false;
    this.clients = [];

    try {
      const data = this.clientsQuery?.data?.() ?? [];
      this.clients = Array.isArray(data)
        ? data.map((c: any, idx: number) => ({
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
      this.clients = [];
    } finally {
      this._isLoading = false;
    }
  }

  async fetchClients(): Promise<any[]> {
    return [];
  }

  onClientCreated(payload: {
    name: { en: string; ar: string };
    contactEmail: string;
    contactPhone: string;
    password: string;
    logo?: string;
    company?: { en: string; ar: string } | null;
  }) {
    const mutate = this.apiQueries.adminCreateClientMutation();
    mutate.mutate(
      payload as any,
      {
        onSuccess: () => this.clientsQuery?.refetch?.(),
      } as any
    );
  }
}
