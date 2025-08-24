import { Component, Input } from '@angular/core';
import { ProfileCardComponent } from '../profile-card/profile-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  standalone: true,
  imports: [CommonModule, ProfileCardComponent],
})
export class CardListComponent {
  @Input() items: any[] = [];
}
