import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../../components/shared/button/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [CommonModule, ButtonComponent],
  standalone: true,
})
export class TopbarComponent {
  onNotifications() {
    // TODO: open notification panel / route to notifications
    console.log('Notification button clicked');
  }
}
