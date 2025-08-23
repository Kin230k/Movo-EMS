import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';

import { CardListComponent } from './components/card-list/card-list.component';
import { ProfileCardComponent } from './components/profile-card/profile-card.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ButtonComponent } from '../../components/shared/button/button';

@NgModule({
  declarations: [
    DashboardComponent,
    SidebarComponent,
    TopbarComponent,
    ProfileCardComponent,
    CardListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
  ],
  exports: [DashboardComponent, ProfileCardComponent],
})
export class DashboardModule {}
