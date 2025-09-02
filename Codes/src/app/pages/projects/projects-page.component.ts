import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// ThemedButton path — adjust to match your repo
import { ThemedButtonComponent } from '../../components/shared/themed-button/themed-button';

import {
  MockProjectsService,
  ProjectSummary,
  LocalizedString,
} from '../../core/services/project.service';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ThemedButtonComponent],
  template: `
    <div class="projects-container">
      <h1 class="title">{{ 'PROJECTS.TITLE' | translate }}</h1>

      <div *ngIf="loading" class="loading">
        {{ 'COMMON.LOADING' | translate }}
      </div>

      <div *ngIf="!loading && projects.length === 0" class="empty">
        {{ 'PROJECTS.NO_PROJECTS_FOUND' | translate }}
      </div>

      <div class="cards">
        <article
          class="card"
          *ngFor="let p of projects"
          (click)="openProject(p)"
          role="button"
          tabindex="0"
          (keydown.enter)="openProject(p)"
        >
          <div class="card-body">
            <div class="card-accent" aria-hidden></div>
            <h2 class="card-title">{{ displayName(p.name) }}</h2>
            <p class="card-desc">{{ displayDescription(p.description) }}</p>
            <div class="dates">
              <div>
                <strong>{{ 'PROJECTS.STARTING_DATE' | translate }}:</strong>
                <span>{{ p.startingDate | date : 'mediumDate' }}</span>
              </div>
              <div *ngIf="p.endingDate">
                <strong>{{ 'PROJECTS.ENDING_DATE' | translate }}:</strong>
                <span>{{ p.endingDate | date : 'mediumDate' }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  `,
  styles: [
    `
      .projects-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }
      .title {
        text-align: left;
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
        background: linear-gradient(180deg, var(--accent), var(--secondary));
        opacity: 0.95;
        box-shadow: 0 6px 12px rgba(var(--shadow-dark), 0.08);
        transition: transform 0.18s ease;
      }
      // animate the  .card::after gradient background keyframes
      @keyframes gradientBackground {
        from {
          background: linear-gradient(
            to right,
            var(--accent),
            var(--secondary)
          );
        }
        to {
          background: linear-gradient(
            to right,
            var(--secondary),
            var(--accent)
          );
        }
      }
      .card::after {
        content: '';
        position: absolute;
        top: -1px;
        left: -1px;
        width: calc(100% + 2px);
        height: calc(100% + 2px);
        border-radius: 12px;
        background: linear-gradient(to right, var(--accent), var(--secondary));
        z-index: -1;
        animation: gradientBackground 10s ease infinite backwards;
      }
      .card:hover .card-accent {
        transform: translateY(-30px) rotate(30deg);
      }
      .card-body {
        position: relative;
        color: var(--bg-dark);
        padding: 1.25rem;
        z-index: 1;
        overflow: hidden;
        border-radius: 12px;
        height: 6rem;
      }
      .card-title {
        margin: 0 0 0.25rem 0;
        font-weight: 700;
        font-size: 1.05rem;
        color: var(--bg-dark);
      }
      .card-desc {
        margin: 0 0 0.5rem 0;
        color: rgba(var(--bg-dark-rgb), 0.65);
        font-size: 0.95rem;
        line-height: 1.35;
        max-height: 3.2em;
        overflow: hidden;
      }
      .dates {
        font-size: 0.85rem;
        color: rgba(var(--bg-dark-rgb), 0.75);
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
        color: rgba(var(--bg-dark-rgb), 0.6);
      }

      @media (max-width: 640px) {
        .card {
          padding: 1rem;
        }
        .card-accent {
          top: 10px;
          right: 10px;
          width: 54px;
          height: 54px;
        }
      }
    `,
  ],
})
export class ProjectsPageComponent implements OnInit {
  private mockService = inject(MockProjectsService);
  private router = inject(Router);

  projects: ProjectSummary[] = [];
  loading = true;

  ngOnInit(): void {
    this.fetchProjects();
  }

  fetchProjects() {
    this.loading = true;
    this.mockService.getProjects().subscribe({
      next: (res) => {
        this.projects = res || [];
        this.loading = false;
      },
      error: () => {
        this.projects = [];
        this.loading = false;
      },
    });
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

  openProject(p: ProjectSummary) {
    this.router.navigate(['projects', p.projectId]);
  }
}
