import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss'],
})
export class DeleteModalComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() message = '';
  @Input() confirmLabel = 'COMMON.BUTTONS.DELETE';
  @Input() cancelLabel = 'COMMON.BUTTONS.CANCEL';
  @Input() set loading(value: boolean) {
    this.isSubmitting.set(value);
    this.hasLoadingInput = true;
  }

  private hasLoadingInput = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  isSubmitting = signal(false);

  ngOnInit() {
    // lock background scroll while modal exists
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(_: KeyboardEvent) {
    this.close.emit();
  }

  onBackdropClick() {
    this.close.emit();
  }

  onCancel(evt?: MouseEvent) {
    evt?.stopPropagation();
    this.close.emit();
  }

  onConfirm(evt?: MouseEvent) {
    evt?.stopPropagation();
    // Only set loading state if parent is not controlling it
    if (!this.hasLoadingInput) {
      this.isSubmitting.set(true);
    }
    this.confirm.emit();
  }
}
