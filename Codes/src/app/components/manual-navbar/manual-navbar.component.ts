import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { IdentityService } from '../../core/services/identity.service';

@Component({
  selector: 'app-manual-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <nav class="manual-navbar">
      <div class="navbar-container">
        <img src="assets/images/logo.png" alt="logo" class="logo" />
        <div class="navbar-links">
          <a
            routerLink="/manual-submissions"
            routerLinkActive="active"
            class="nav-link"
          >
            {{
              'NAV.MANUAL_SUBMISSIONS'
                | translate : { default: 'Manual Submissions' }
            }}
          </a>

          <a
            routerLink="/take-attendance"
            routerLinkActive="active"
            class="nav-link"
          >
            {{
              'NAV.TAKE_ATTENDANCE' | translate : { default: 'Take Attendance' }
            }}
          </a>

          <a (click)="signOut()" class="nav-link" role="button" tabindex="0">
            {{ 'COMMON.SIGN_OUT' | translate : { default: 'Sign out' } }}
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .manual-navbar {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #fff;
        border-bottom: 1px solid var(--color-font-primary);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .navbar-container {
        margin: 0 auto;
        max-width: 1200px;
        padding: 1rem 2rem;
        display: flex;
        gap: 1rem;
        justify-content: space-between;
        align-items: center;
      }

      .navbar-links {
        display: flex;
        gap: 1rem;
      }

      .logo {
        height: 5rem;
        width: min-content;
      }

      .nav-link {
        color: var(--color-font-primary);
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-card);
        font-weight: 500;
        transition: all 0.2s ease;

        &:hover {
          background: var(--color-font-primary);
          color: var(--color-font-primary);
        }

        &.active {
          color: var(--accent);
          font-weight: 600;
        }
      }

      @media (max-width: 768px) {
        .navbar-container {
          padding: 1rem;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-link {
          text-align: center;
          padding: 0.75rem 1rem;
        }
      }
    `,
  ],
})
export class ManualNavbarComponent {
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
