import {
  Component,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-combo-selector',
  templateUrl: './combo-selector.component.html',
  styleUrls: ['./combo-selector.component.scss'],
  imports: [CommonModule, FormsModule, TranslateModule],
  standalone: true,
})
export class ComboSelectorComponent implements AfterViewInit, OnChanges {
  @Input() projects: { id: any; name: { en: string; ar: string } }[] = [];
  @Input() selectedValue: any = '';
  @Input() hasError: boolean = false;
  @Output() projectSelected = new EventEmitter<any | null>();

  // Getter and setter for ngModel two-way binding
  get value(): any {
    return this.selectedValue;
  }

  set value(val: any) {
    this.selectedValue = val;
    this.onModelChange(val);
  }
  @Input() placeholder: string = '';
  @ViewChild('selectElement', { static: false })
  selectElement!: ElementRef<HTMLSelectElement>;

  constructor(private translate: LanguageService) {}

  get currentLang(): 'en' | 'ar' {
    return this.translate.currentLang;
  }

  onModelChange(value: any) {
    if (value) {
      // Find the selected project using strict equality
      const selectedProject = this.projects.find(
        (p) => String(p.id) === String(value)
      );
      const emitValue = selectedProject ? selectedProject.id : value;
      this.projectSelected.emit(emitValue);
    } else {
      // Emit null when placeholder (empty value) is selected
      this.projectSelected.emit(null);
    }
  }

  onSelect(event: Event) {
    // Keep this for backward compatibility, but ngModel should handle most cases
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.onModelChange(value);
  }

  ngOnChanges(changes: SimpleChanges) {
    // ngModel will handle the value binding automatically
    // No need for manual value setting
  }

  ngAfterViewInit() {
    // ngModel will handle the initial value binding
    // No need for manual value setting
  }

  // Helper method to compare values (handles string vs number comparison)
  getSelectedValue(): string {
    // Explicitly return empty string for null, undefined, or empty values
    if (
      this.selectedValue === null ||
      this.selectedValue === undefined ||
      this.selectedValue === '' ||
      this.selectedValue === 'null' ||
      this.selectedValue === 'undefined'
    ) {
      return '';
    }

    // Ensure we return a string value for the select element
    return String(this.selectedValue);
  }
}
