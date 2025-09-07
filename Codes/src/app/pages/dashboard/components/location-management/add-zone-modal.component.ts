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
    name: { en: string; ar: string };
    locationId?: string;
  }>();

  nameEn = '';
  nameAr = '';
  selectedLocationId = '';
  error = '';

  ngOnInit() {}

  onLocationSelected(id: string | null) {
    this.selectedLocationId = id || '';
  }

  validateAndCreate() {
    if (!this.nameAr) {
      this.error = 'Please provide a nameAr';
      return;
    }
    if (!this.nameEn) {
      this.error = 'Please provide a nameEn';
      return;
    }
    if (!this.selectedLocationId) {
      this.error = 'Please select a location';
      return;
    }
    console.log({
      name: { en: this.nameEn, ar: this.nameAr },
      locationId: this.selectedLocationId,
    });
    this.create.emit({
      name: { en: this.nameEn, ar: this.nameAr },
      locationId: this.selectedLocationId,
    });
  }

  onClose() {
    this.close.emit();
  }
}
