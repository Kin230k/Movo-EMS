import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemedButtonComponent } from "../../../../components/shared/themed-button/themed-button";

@Component({
  selector: 'app-location-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, ThemedButtonComponent],
  templateUrl: './location-card.component.html',
  styleUrls: ['./location-card.component.scss'],
})
export class LocationCardComponent {
  @Input() data: any;
  @Output() deleteLocation = new EventEmitter<string>();
  @Output() updateLocation = new EventEmitter<any>();

  get displayName(): string {
    if (!this.data) return '';
    const name = this.data.name;
    if (!name) return '';
    if (typeof name === 'string') return name;
    const isRtl = document.documentElement.dir === 'rtl';
    const lang = isRtl ? 'ar' : 'en';
    return name[lang] || name['en'] || Object.values(name)[0] || '';
  }

  get displayProjectName(): string {
    const projectName = this.data?.projectName;
    if (!projectName) return '';
    if (typeof projectName === 'string') return projectName;
    const isRtl = document.documentElement.dir === 'rtl';
    const lang = isRtl ? 'ar' : 'en';
    return (
      projectName[lang] ||
      projectName['en'] ||
      Object.values(projectName)[0] ||
      ''
    );
  }

  onDelete() {
    if (this.data?.locationId) {
      this.deleteLocation.emit(this.data.locationId);
    }
  }

  onUpdate() {
    if (this.data) {
      this.updateLocation.emit(this.data);
    }
  }
}
