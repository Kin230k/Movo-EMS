import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [CommonModule, ComboSelectorComponent],
  standalone: true,
})
export class TopbarComponent {
  @Input() projects: { id: number; name: string }[] = [];
  @Output() projectSelected = new EventEmitter<number>();
}
