import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-combo-selector',
  templateUrl: './combo-selector.component.html',
  styleUrls: [], // Remove the SCSS reference
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class ComboSelectorComponent {
  @Input() projects: { id: number; name: string }[] = []; // Change from 'combos' to 'projects'
  @Output() projectSelected = new EventEmitter<number>(); // Change from 'comboSelected' to 'projectSelected'

  onSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    if (value) {
      this.projectSelected.emit(+value);
    }
  }
}
