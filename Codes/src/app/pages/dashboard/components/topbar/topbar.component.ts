import { Component } from '@angular/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone: false,
})
export class TopbarComponent {
  onNotifications() {
    // TODO: open notification panel / route to notifications
    console.log('Notification button clicked');
  }
}
