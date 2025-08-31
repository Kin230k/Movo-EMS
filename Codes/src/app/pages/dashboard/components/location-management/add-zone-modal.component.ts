import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ComboSelectorComponent } from '../../../../components/shared/combo-selector/combo-selector.component';

@Component({
  selector: 'app-add-zone-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ComboSelectorComponent],
  templateUrl: './add-zone-modal.component.html',
  styleUrls: ['./add-zone-modal.component.scss'],
})
export class AddZoneModalComponent implements OnInit {
  @Input() locations: { id: string; name: { en: string; ar: string } }[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{
    name: string;
    locationId?: string;
  }>();

  name = '';
  selectedLocationId = '';
  error = '';

  ngOnInit() {}

  onLocationSelected(id: string | null) {
    console.log('onLocationSelected', id);
    this.selectedLocationId = id || '';
  }

  validateAndCreate() {
    if (!this.name) {
      this.error = 'Please provide a name';
      return;
    }
    if (!this.selectedLocationId) {
      this.error = 'Please select a location';
      return;
    }
    this.create.emit({
      name: this.name,
      locationId: this.selectedLocationId,
    });
  }

  onClose() {
    this.close.emit();
  }
}
