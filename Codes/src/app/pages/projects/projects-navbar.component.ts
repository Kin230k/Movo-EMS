import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { IdentityService } from '../../core/services/identity.service';
import { LanguageSwitcherComponent } from '../../components/shared/language-switcher/language-switcher.component';

@Component({
  selector: 'app-projects-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    LanguageSwitcherComponent,
  ],
  template: `
    <nav class="proj-navbar">
      <img src="assets/images/logo.png" alt="logo" class="logo" />
      <div class="container">
        <app-language-switcher></app-language-switcher>
        <span class="spacer"></span>

        <a routerLink="/projects" routerLinkActive="active" class="link">
          {{ 'NAV.PROJECTS' | translate : { default: 'Projects' } }}
        </a>
        <a (click)="signOut()" class="link" role="button" tabindex="0">
          {{ 'COMMON.SIGN_OUT' | translate : { default: 'Sign out' } }}
        </a>
      </div>
    </nav>
  `,
  styles: [
    `
      .logo {
        height: 5rem;
      }
      .proj-navbar {
        max-width: 1200px;
        margin: 0 auto;
        background: #fff;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .container {
        padding: 0.75rem 1rem;
      }
      .link {
        text-decoration: none;
        margin-left: 0.75rem;
        color: var(--color-font-primary);
        cursor: pointer;
      }
      .spacer {
        flex: 1 1 auto;
      }
      .active {
        font-weight: 600;
        color: var(--accent);
      }
      @media (max-width: 500px) {
        .proj-navbar {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class ProjectsNavbarComponent {
  constructor(
    private auth: AuthService,
    private router: Router,
    private identity: IdentityService
  ) {}
  async signOut() {
    await this.auth.logout();
    this.identity.resetIdentity();
    this.router.navigate(['/login']);
  }
}
