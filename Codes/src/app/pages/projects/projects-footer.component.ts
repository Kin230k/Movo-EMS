import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-projects-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <footer class="proj-footer">
      <div class="container">
        <a routerLink="/projects" routerLinkActive="active" class="link">
          {{ 'NAV.PROJECTS' | translate : { default: 'Projects' } }}
        </a>
      </div>
    </footer>
  `,
  styles: [
    `
      .proj-footer {
        position: sticky;
        bottom: 0;
        background: #fff;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0.75rem 1rem;
        display: flex;
        gap: 1rem;
      }
      .link {
        text-decoration: none;
        color: var(--color-font-primary);
      }
      .active {
        font-weight: 600;
        color: var(--accent);
      }
    `,
  ],
})
export class ProjectsFooterComponent {}
