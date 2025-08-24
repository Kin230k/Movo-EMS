import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../../../../../components/shared/button/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss'],
  imports: [CommonModule, ButtonComponent],
  standalone: true,
})
export class ProfileCardComponent {
  @Input() data: any;
}
