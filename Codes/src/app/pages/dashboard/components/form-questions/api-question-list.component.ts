import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ThemedButtonComponent } from "../../../../components/shared/themed-button/themed-button";

@Component({
  selector: 'app-api-question-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ThemedButtonComponent],
  templateUrl: './api-question-list.component.html',
  styleUrls: ['./api-question-list.component.scss'],
})
export class ApiQuestionListComponent {
  @Input() questions!: FormArray<FormGroup>;

  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  onEdit(index: number) {
    this.edit.emit(index);
  }

  onDelete(index: number) {
    this.delete.emit(index);
  }

  trackById(index: number, group: FormGroup) {
    return group.get('id')?.value || index;
  }
}
