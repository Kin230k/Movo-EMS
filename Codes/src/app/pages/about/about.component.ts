import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <section class="about">
      <h1>{{ 'ABOUT.TITLE' | translate : { default: 'About Us' } }}</h1>
      <p>
        {{
          'ABOUT.DESCRIPTION'
            | translate
              : {
                  default:
                    'We build tools to streamline event and workforce management.'
                }
        }}
      </p>
    </section>
  `,
  styles: [
    `
      .about {
        max-width: 1000px;
        margin: 1.5rem auto;
        padding: 1rem;
      }
      h1 {
        margin: 0 0 0.5rem 0;
      }
      p {
        color: rgba(var(--bg-dark-rgb), 0.75);
      }
    `,
  ],
})
export class AboutComponent {}
