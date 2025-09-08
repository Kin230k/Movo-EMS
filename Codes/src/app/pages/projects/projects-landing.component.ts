import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-projects-landing',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <section class="landing">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </section>
  `,
  styles: [
    `
      .landing {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1.25rem 1rem;
      }
      h1 {
        margin: 0 0 0.5rem 0;
      }
      p {
        margin: 0;
        color: rgba(var(--bg-dark-rgb), 0.7);
      }
    `,
  ],
})
export class ProjectsLandingComponent {
  @Input() title: string = 'Welcome';
  @Input() subtitle: string = 'Choose a project to proceed';
}
