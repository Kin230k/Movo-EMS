import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemedButtonComponent } from '../../../../../components/shared/themed-button/themed-button';
import { TranslateModule } from '@ngx-translate/core';
import { AddClientModalComponent } from './add-client-modal.component';

@Component({
  selector: 'app-client-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [
    CommonModule,
    ThemedButtonComponent,
    TranslateModule,
    AddClientModalComponent,
  ],
})
export class ClientTopbarComponent {
  @Output() clientCreated = new EventEmitter<{
    name: { en: string; ar: string };
    contactEmail: string;
    contactPhone: string;
    password: string;
    logo?: string;
    company?: { en: string; ar: string } | null;
  }>();

  showAddClient = false;

  openAddClient() {
    this.showAddClient = true;
  }

  onModalClose() {
    this.showAddClient = false;
  }

  onClientCreated(payload: {
    name: { en: string; ar: string };
    contactEmail: string;
    contactPhone: string;
    password: string;
    logo?: string;
    company?: { en: string; ar: string } | null;
  }) {
    this.clientCreated.emit(payload);
    this.showAddClient = false;
  }
}
