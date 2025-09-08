import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './status-modal.component.html',
  styleUrls: ['./status-modal.component.scss'],
})
export class StatusModalComponent {
  @Input() currentStatus: 'ACCEPTED' | 'REJECTED' | 'MANUAL_REVIEW' | null =
    null;
  @Input() decisionNotes: string | null = null;
  @Input() isLoading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    outcome: 'ACCEPTED' | 'REJECTED' | 'MANUAL_REVIEW';
    decisionNotes?: string;
  }>();
  @Output() refetch = new EventEmitter<void>();

  selectedStatus: 'ACCEPTED' | 'REJECTED' | 'MANUAL_REVIEW' = 'MANUAL_REVIEW';
  notes: string = '';

  ngOnChanges() {
    if (this.currentStatus === 'ACCEPTED') this.selectedStatus = 'ACCEPTED';
    else if (this.currentStatus === 'REJECTED')
      this.selectedStatus = 'REJECTED';
    else this.selectedStatus = 'MANUAL_REVIEW';

    this.notes = this.decisionNotes || '';
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    let outcome: 'ACCEPTED' | 'REJECTED' | 'MANUAL_REVIEW' = 'MANUAL_REVIEW';
    if (this.selectedStatus === 'ACCEPTED') outcome = 'ACCEPTED';
    else if (this.selectedStatus === 'REJECTED') outcome = 'REJECTED';
    else outcome = 'MANUAL_REVIEW';

    this.save.emit({ outcome, decisionNotes: this.notes });
    this.refetch.emit();
  }
}
