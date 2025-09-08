import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// ThemedButton path — adjust to match your repo

import api from '../../core/api/api';
import { LoadingSpinnerComponent } from '../../components/shared/loading-spinner/loading-spinner.component';
import { ProjectsNavbarComponent } from './projects-navbar.component';
// import { ProjectsFooterComponent } from './projects-footer.component';

// Local types (formerly from project.service)
type LocalizedString = { en: string; ar: string };
interface ProjectSummary {
  projectId: string;
  name: LocalizedString | string;
  description?: LocalizedString | string | null;
  startingDate?: string | null;
  endingDate?: string | null;
}
@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ProjectsNavbarComponent,
    LoadingSpinnerComponent,
    // ProjectsLandingComponent,
  ],
  template: `
    <app-projects-navbar></app-projects-navbar>

    <!-- <app-projects-landing
      [title]="'PROJECTS.TITLE' | translate"
      [subtitle]="
        ('PROJECTS.SUBTITLE' | translate) || 'Explore available projects'
      "
    ></app-projects-landing> -->

    <div class="projects-container">
      <h1 class="title">{{ 'PROJECTS.TITLE' | translate }}</h1>

      <div *ngIf="loading">
        <app-loading-spinner
          [label]="'COMMON.LOADING' | translate"
        ></app-loading-spinner>
      </div>

      <div *ngIf="!loading && projects.length === 0" class="empty">
        {{ 'PROJECTS.NO_PROJECTS_FOUND' | translate }}
      </div>

      <div class="cards">
        <!-- bind index as --i so CSS can stagger animations per-card -->
        <article
          class="card"
          *ngFor="let p of projects; let i = index"
          (click)="openProject(p)"
          role="button"
          tabindex="0"
          (keydown.enter)="openProject(p)"
          [style.--i]="i"
        >
          <div class="card-body">
            <div class="card-accent" aria-hidden></div>
            <h2 class="card-title">{{ displayName(p.name) }}</h2>
            <p class="card-desc">{{ displayDescription(p.description) }}</p>
            <div class="dates">
              <div *ngIf="p.startingDate">
                <strong>{{ 'PROJECTS.STARTING_DATE' | translate }}:</strong>
                <span>{{ displayDate(p.startingDate) }}</span>
              </div>
              <div *ngIf="p.endingDate">
                <strong>{{ 'PROJECTS.ENDING_DATE' | translate }}:</strong>
                <span>{{ displayDate(p.endingDate) }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- <app-projects-footer></app-projects-footer> -->
  `,
  styles: [
    `
      .projects-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }
      .title {
        text-align: start;
        margin: 0 0 1rem 0;
        font-size: 1.75rem;
        color: var(--bg-dark);
      }

      /* exactly 2 columns on large screens, 1 column on small */
      .cards {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      @media (min-width: 1100px) {
        .cards {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      /* Entrance animation: staggered by --i */
      .card {
        position: relative;
        border-radius: 12px;
        cursor: pointer;
        background: var(--white);
        transition: transform 0.18s ease, box-shadow 0.18s ease;
        box-shadow: 0 6px 10px rgba(var(--shadow-dark), 0.08);
        outline: none;
      }
      .card:focus {
        box-shadow: 0 12px 18px rgba(var(--shadow-dark), 0.12);
      }
      .card:hover {
        box-shadow: 0 10px 12px rgba(var(--shadow-dark), 0.1);
      }

      /* decorative diagonal accent on the top-right corner */
      .card-accent {
        position: absolute;
        top: -1.5rem;
        right: 3.5rem;
        width: 6rem;
        height: 30rem;
        transform: rotate(30deg);
        border-radius: 6px;
        // animate the gradient from bottom to top
        background: linear-gradient(0deg, var(--accent), var(--secondary));
        opacity: 0.95;
        box-shadow: 0 6px 12px rgba(var(--shadow-dark), 0.08);
        transition: transform 0.18s ease;
      }

      /* improved animated gradient background behind each card */
      .card::after {
        content: '';
        position: absolute;
        top: -0.5px;
        left: -0.5px;
        width: calc(100% + 1px);
        height: calc(100% + 1px);
        border-radius: 12px;
        z-index: -1;

        /* richer multi-stop gradient (uses fallbacks for new CSS vars) */
        background: linear-gradient(
          90deg,
          var(--accent),
          var(--secondary) 50%,
          var(--accent)
        );

        /* make the gradient much wider than the element so animation moves smoothly */
        background-size: 300% 100%;
        background-position: 0% 50%;

        /* smooth continuous animation: moves gradient left → right → left */
        animation: gradientMove 10s ease-in-out infinite alternate;
        /* subtle soft blur for depth, keep low so text contrast is unaffected */
        filter: blur(3px) saturate(1.05);
        opacity: 0.95;
      }

      /* gentler, smoother movement with an ease curve and back-and-forth (alternate-like effect) */
      @keyframes gradientMove {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }

      .card:hover .card-accent {
        transform: translateY(-30px) rotate(-30deg);
      }

      .card-body {
        position: relative;
        padding: 1.25rem;
        z-index: 1;
        overflow: hidden;
        border-radius: 12px;
        height: 6rem;
        background: var(--bg-dark);
        color: var(--white);
      }
      .card-title {
        margin: 0 0 0.25rem 0;
        font-weight: 700;
        font-size: 1.05rem;
      }
      .card-desc {
        margin: 0 0 0.5rem 0;
        font-size: 0.95rem;
        line-height: 1.35;
        max-height: 3.2em;
        overflow: hidden;
      }
      .dates {
        font-size: 0.85rem;
      }

      .card-actions {
        margin-top: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .loading,
      .empty {
        text-align: center;
        padding: 1rem;
      }

      @media (max-width: 640px) {
        .card-accent {
          display: none;
        }
      }
      :host-context(html[dir='rtl']) .card-accent {
        right: calc(80% + 1px);
        transform: rotate(-30deg);
      }
      :host-context(html[dir='rtl']) .card:hover .card-accent {
        transform: translateY(-30px) rotate(30deg);
      }

      /* Respect users' reduced motion preference */
      @media (prefers-reduced-motion: reduce) {
        .card,
        .card::after,
        .card-accent {
          transition: none !important;
          animation: none !important;
        }
      }
    `,
  ],
})
export class ProjectsPageComponent implements OnInit {
  private router = inject(Router);
  private translate = inject(TranslateService);
  private _projects: ProjectSummary[] = [];
  private _loading = true;

  get projects(): ProjectSummary[] {
    return this._projects;
  }

  get loading(): boolean {
    return this._loading;
  }

  async ngOnInit(): Promise<void> {
    try {
      this._loading = true;
      const data: any = await api.getAllActiveProjects();
      const payload = (data as any)?.result ?? data ?? {};
      this._projects = Array.isArray(payload.projects) ? payload.projects : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      this._projects = [];
    } finally {
      this._loading = false;
    }
  }

  async fetchProjects() {
    try {
      this._loading = true;
      const data: any = await api.getAllActiveProjects();
      const payload = (data as any)?.result ?? data ?? {};
      this._projects = Array.isArray(payload.projects) ? payload.projects : [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      this._projects = [];
    } finally {
      this._loading = false;
    }
  }

  displayName(name: LocalizedString | string | undefined) {
    if (!name) return '';
    if (typeof name === 'string') return name;
    // render the name in the current language
    const lang =
      this.translate.getCurrentLang() ||
      (document.documentElement.dir === 'rtl' ? 'ar' : 'en');
    return name[lang as keyof LocalizedString] || name.en || name.ar || '';
  }

  displayDescription(d?: LocalizedString | string | null) {
    if (!d) return '';
    if (typeof d === 'string') return d;
    return d.en || d.ar || '';
  }

  displayDate(d?: string | null): string | null {
    if (!d) return null;
    if (typeof d === 'string') return new Date(d).toLocaleDateString();
    return null;
  }

  openProject(p: ProjectSummary) {
    this.router.navigate(['projects', p.projectId]);
  }
}
