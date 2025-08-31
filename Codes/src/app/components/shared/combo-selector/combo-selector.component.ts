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
  @Input() placeholder: string = '';
  @ViewChild('selectElement', { static: false })
  selectElement!: ElementRef<HTMLSelectElement>;

  constructor(private translate: LanguageService) {}

  get currentLang(): 'en' | 'ar' {
    return this.translate.currentLang;
  }

  onSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    if (value) {
      // Try to convert to number if the original value was a number
      const selectedProject = this.projects.find((p) => p.id == value);
      this.projectSelected.emit(selectedProject ? selectedProject.id : value);
    } else {
      // Emit null when placeholder (empty value) is selected
      this.projectSelected.emit(null);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // React to changes in selectedValue input
    if (changes['selectedValue'] && this.selectElement) {
      setTimeout(() => {
        if (this.selectElement) {
          const newValue = this.getSelectedValue();
          this.selectElement.nativeElement.value = newValue;
        }
      }, 0);
    }
  }

  ngAfterViewInit() {
    // Force re-evaluation of selected value after view is initialized
    // This helps ensure the correct option is selected when component loads

    setTimeout(() => {
      if (this.selectElement) {
        const currentValue = this.getSelectedValue();
        this.selectElement.nativeElement.value = currentValue;

        // If the value is empty, ensure placeholder is shown
        if (currentValue === '') {
          this.selectElement.nativeElement.value = '';
        }
      }
    }, 0);
  }

  // Helper method to compare values (handles string vs number comparison)
  getSelectedValue(): any {
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

    return this.selectedValue;
  }
}
