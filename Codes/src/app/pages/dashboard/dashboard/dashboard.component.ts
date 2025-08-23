import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false,
})
export class DashboardComponent {
  // sample array for demo
  cards = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    name: 'Name',
    role: 'Supervisor',
    phone: '0987654321',
    marital: 'Marred',
    date: '2024/2/13',
    salary: '1200$',
  }));
}
