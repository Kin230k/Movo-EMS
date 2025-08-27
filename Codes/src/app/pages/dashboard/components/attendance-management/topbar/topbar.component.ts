import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [CommonModule, ComboSelectorComponent, TranslateModule],
  standalone: true,
})
export class TopbarComponent {
  @Input() projects: { id: number; name: { ar: string; en: string } }[] = [];
  @Output() projectSelected = new EventEmitter<number>();
}
