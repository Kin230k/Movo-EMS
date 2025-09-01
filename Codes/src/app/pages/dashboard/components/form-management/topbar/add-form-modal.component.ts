import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project, Location } from './topbar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../core/services/language.service';
import { ComboSelectorComponent } from '../../../../../components/shared/combo-selector/combo-selector.component';

@Component({
  selector: 'app-add-form-modal',
  templateUrl: './add-form-modal.component.html',
  styleUrls: ['./add-form-modal.component.scss'],
  imports: [CommonModule, FormsModule, TranslateModule, ComboSelectorComponent],
  standalone: true,
})
export class AddFormModalComponent {
  @Input() projects: Project[] = [];
  @Input() locations: Location[] = [];
  @Input() selectedProjectId: string | null = null;
  @Input() selectedLocationId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() formCreated = new EventEmitter<{
    projectId: string;
    locationId?: string;
    formName?: string;
  }>();

  // New: hold the user-entered form name
  formName: string = '';

  errorMessage = '';
  relationType: 'project' | 'location' = 'project';

  constructor(
    private languageService: LanguageService,
    private translate: TranslateService
  ) {}

  get currentLang(): 'en' | 'ar' {
    return this.languageService.currentLang;
  }

  get selectedProject(): Project | undefined {
    return this.projects.find((p) => p.id === this.selectedProjectId);
  }

  get selectedLocation(): Location | undefined {
    return this.locations.find((l) => l.id === this.selectedLocationId);
  }

  onProjectSelected(projectId: string) {
    console.log('projectId', projectId);
    this.selectedProjectId = projectId ? projectId : null;
    this.errorMessage = '';
  }

  onLocationSelected(locationId: string) {
    this.selectedLocationId = locationId ? locationId : null;
    this.errorMessage = '';
  }

  onRelationTypeChange() {
    // Reset location selection when switching to project relation
    if (this.relationType === 'project') {
      this.selectedLocationId = null;
    }
    this.errorMessage = '';
  }

  createForm() {
    if (!this.selectedProjectId) {
      this.errorMessage = this.translate.instant(
        'FORM_MANAGEMENT.PLEASE_SELECT_A_PROJECT'
      );
      console.log('errorMessage', this.errorMessage);
      return;
    }

    if (this.relationType === 'location' && !this.selectedLocationId) {
      this.errorMessage = this.translate.instant(
        'FORM_MANAGEMENT.PLEASE_SELECT_A_LOCATION'
      );
      console.log('errorMessage', this.errorMessage);
      return;
    }

    if (!this.isFormNameValid()) {
      this.errorMessage = this.translate.instant(
        'FORM_MANAGEMENT.PLEASE_ENTER_FORM_NAME'
      );
      return;
    }

    this.formCreated.emit({
      projectId: this.selectedProjectId,
      locationId:
        this.relationType === 'location'
          ? this.selectedLocationId || undefined
          : undefined,
      formName: this.formName.trim(),
    });
  }

  // Optionally validate form name before creating
  private isFormNameValid(): boolean {
    return this.formName != null && this.formName.trim().length > 0;
  }

  // Handler for the 'Select Form' button (currently stubbed)
  onSelectForm() {
    // TODO: implement selection logic (navigate to form picker or open nested modal)
    console.log('Select form clicked - location:', this.selectedLocationId);
  }

  onClose() {
    this.close.emit();
  }
}
