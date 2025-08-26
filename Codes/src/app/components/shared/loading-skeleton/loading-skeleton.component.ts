import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="skeleton-root" aria-hidden="true"></span>`,
  styles: [
    `
      .skeleton-root {
        display: inline-block;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.03),
          rgba(255, 255, 255, 0.06),
          rgba(255, 255, 255, 0.03)
        );
        background-size: 200% 100%;
        animation: shimmer 1.2s linear infinite;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSkeletonComponent {}
