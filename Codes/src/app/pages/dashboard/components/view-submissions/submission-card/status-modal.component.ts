import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() currentStatus: 'accepted' | 'rejected' | 'manual_review' | null =
    null;
  @Input() decisionNotes: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    outcome: 'approved' | 'rejected' | 'pending';
    decisionNotes?: string;
  }>();

  selectedStatus: 'accepted' | 'rejected' | 'manual_review' = 'manual_review';
  notes: string = '';

  ngOnChanges() {
    if (this.currentStatus === 'accepted') this.selectedStatus = 'accepted';
    else if (this.currentStatus === 'rejected')
      this.selectedStatus = 'rejected';
    else this.selectedStatus = 'manual_review';

    this.notes = this.decisionNotes || '';
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    let outcome: 'approved' | 'rejected' | 'pending' = 'pending';
    if (this.selectedStatus === 'accepted') outcome = 'approved';
    else if (this.selectedStatus === 'rejected') outcome = 'rejected';
    else outcome = 'pending';

    this.save.emit({ outcome, decisionNotes: this.notes });
  }
}
