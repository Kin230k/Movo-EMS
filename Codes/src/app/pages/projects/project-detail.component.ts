import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectsNavbarComponent } from './projects-navbar.component';
import { ProjectsFooterComponent } from './projects-footer.component';

// ThemedButton path — adjust to match your repo
import { ThemedButtonComponent } from '../../components/shared/themed-button/themed-button';

import { ApiQueriesService } from '../../core/services/queries.service';

// Local types (formerly from project.service)
type LocalizedString = { en: string; ar: string };
interface LocationSummary {
  locationId: string;
  name?: LocalizedString | string;
  formId?: string | null;
}
interface ProjectSummary {
  projectId: string;
  name: LocalizedString | string;
  description?: LocalizedString | string | null;
  startingDate?: string | null;
  endingDate?: string | null;
  formId?: string | null;
  locations?: LocationSummary[] | null;
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    ProjectsNavbarComponent,
    ThemedButtonComponent,
  ],
  template: `
    <app-projects-navbar></app-projects-navbar>

    <div class="detail-container" *ngIf="!loading && project; else loadingTpl">
      <button class="back" (click)="goBack()">
        &larr; {{ 'COMMON.BUTTONS.CANCEL' | translate }}
      </button>

      <div class="card detail-card">
        <div class="detail-info">
          <h2>{{ displayName(project.name) }}</h2>
          <p class="desc">{{ displayDescription(project.description) }}</p>
          <div class="dates">
            <div>
              <strong>{{ 'PROJECTS.STARTING_DATE' | translate }}:</strong>
              {{ project.startingDate | date : 'mediumDate' }}
            </div>
            <div *ngIf="project.endingDate">
              <strong>{{ 'PROJECTS.ENDING_DATE' | translate }}:</strong>
              {{ project.endingDate | date : 'mediumDate' }}
            </div>
          </div>
        </div>

        <hr class="divider" />

        <!-- direct form -->
        <div *ngIf="project.formId" class="actions-row">
          <p>
            {{ 'PROJECTS.FORM' | translate }}:
            <strong>{{ project.formId }}</strong>
          </p>
          <themed-button
            [text]="
              'PROJECTS.OPEN_SELECTED_FORM'
                | translate : { default: 'PROJECTS.OPEN_FORM' | translate }
            "
            (onClick)="goToForm(project.formId)"
          ></themed-button>
        </div>

        <!-- locations -->
        <div
          *ngIf="
            !project.formId && project.locations && project.locations.length > 0
          "
        >
          <p>Select a location to open its form:</p>
          <div class="locations-list">
            <label *ngFor="let loc of project.locations" class="loc-row">
              <input
                type="radio"
                name="location"
                [(ngModel)]="selectedLocationId"
                [value]="loc.locationId"
                (change)="onLocationSelected(loc)"
              />
              <span class="loc-name">{{ displayName(loc.name) }}</span>
              <small class="loc-hint">{{
                loc.formId ? 'Form ready' : 'No form'
              }}</small>
            </label>
          </div>

          <div class="actions">
            <themed-button
              [disabled]="!selectedLocationFormId"
              [text]="'PROJECTS.OPEN_SELECTED_FORM' | translate"
              (onClick)="goToForm(selectedLocationFormId)"
            ></themed-button>
            <div *ngIf="selectedLocationFormId === null" class="warning">
              {{
                'PROJECTS.SELECTED_LOCATION_HAS_NO_FORM_CONFIGURED' | translate
              }}
            </div>
          </div>
        </div>

        <div
          *ngIf="
            !project.formId &&
            (!project.locations || project.locations.length === 0)
          "
        >
          <p>
            {{ 'PROJECTS.NO_FORM_IS_CONFIGURED_FOR_THIS_PROJECT' | translate }}
          </p>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="loading">{{ 'COMMON.LOADING' | translate }}</div>
    </ng-template>
    <!-- <app-projects-footer></app-projects-footer> -->
  `,
  styles: [
    `
      .detail-container {
        max-width: 980px;
        margin: 1.5rem auto;
        padding: 1rem;
      }
      .back {
        background: transparent;
        border: none;
        color: rgba(var(--bg-dark-rgb), 0.7);
        cursor: pointer;
        margin-bottom: 1rem;
      }

      .detail-card {
        position: relative;
        padding: 1.25rem;
        border-radius: 12px;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.02),
          rgba(0, 0, 0, 0.02)
        );
        color: var(--bg-dark);
      }
      .card-accent {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 86px;
        height: 86px;
        transform: rotate(18deg);
        border-radius: 8px;
        background: linear-gradient(180deg, var(--accent), var(--secondary));
        opacity: 0.95;
        box-shadow: 0 6px 12px rgba(var(--shadow-dark), 0.08);
      }

      .detail-info h2 {
        margin: 0 0 0.25rem 0;
        color: var(--bg-dark);
      }
      .desc {
        color: rgba(var(--bg-dark-rgb), 0.65);
        margin: 0 0 0.5rem 0;
      }

      .divider {
        border: 0;
        height: 1px;
        margin: 1rem 0;
        background: linear-gradient(
          to right,
          rgba(var(--bg-dark-rgb), 0),
          rgba(var(--secondary-rgb), 0.14),
          rgba(var(--bg-dark-rgb), 0)
        );
      }

      .locations-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: 1rem 0;
      }
      .loc-row {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        padding: 0.5rem;
        border-radius: 8px;
      }
      .loc-row input {
        transform: scale(1.05);
      }
      .loc-name {
        font-weight: 600;
        color: var(--bg-dark);
      }
      .loc-hint {
        margin-left: auto;
        color: rgba(var(--bg-dark-rgb), 0.6);
        font-size: 0.85rem;
      }

      .actions {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .actions-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .warning {
        color: rgba(var(--bg-dark-rgb), 0.65);
      }
      .loading {
        color: rgba(var(--bg-dark-rgb), 0.6);
      }
      @media (max-width: 640px) {
        .detail-card {
          padding: 1rem;
        }
        .card-accent {
          top: 10px;
          right: 10px;
          width: 64px;
          height: 64px;
        }
      }
    `,
  ],
})
export class ProjectDetailComponent implements OnInit {
  private apiQueries = inject(ApiQueriesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  projectId!: string | null;
  projectQuery: any;
  get project(): ProjectSummary | null {
    const data = this.projectQuery?.data?.() ?? null;
    return data.project;
  }
  get loading(): boolean {
    return this.projectQuery?.isLoading?.() ?? false;
  }

  selectedLocationId: string | null = null;
  selectedLocationFormId: string | null | undefined = undefined;

  async ngOnInit(): Promise<void> {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
    if (this.projectId) await this.fetchProject(this.projectId);
  }

  async fetchProject(id: string) {
    this.projectQuery = this.apiQueries.getProjectInfoByIdQuery({
      projectId: id,
    } as any);
    await this.projectQuery.refetch();
  }

  displayName(name: LocalizedString | string | undefined) {
    if (!name) return '';
    if (typeof name === 'string') return name;
    return name.en || name.ar || '';
  }

  displayDescription(d?: LocalizedString | string | null) {
    if (!d) return '';
    if (typeof d === 'string') return d;
    return d.en || d.ar || '';
  }

  goToForm(formId?: string | null) {
    if (!formId) return;
    this.router.navigate(['/form', formId]);
  }

  goBack() {
    this.router.navigate(['/projects']);
  }

  onLocationSelected(loc: LocationSummary) {
    this.selectedLocationFormId = loc.formId ?? null;
  }
}
