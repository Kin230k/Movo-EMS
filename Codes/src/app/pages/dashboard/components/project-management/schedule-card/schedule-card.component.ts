import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface ScheduleData {
  scheduleId: string;
  projectId: string;
  startDateTime: string;
  endDateTime: string;
  createdAt: string;
  projectName?: { en: string; ar: string };
}

@Component({
  selector: 'app-schedule-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.scss'],
})
export class ScheduleCardComponent {
  @Input() schedule!: ScheduleData;
  @Output() edit = new EventEmitter<ScheduleData>();
  @Output() delete = new EventEmitter<ScheduleData>();

  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  }

  formatDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString();
  }

  formatTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  onEdit() {
    this.edit.emit(this.schedule);
  }

  onDelete() {
    this.delete.emit(this.schedule);
  }
}
