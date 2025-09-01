import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skeleton-profile-card',
  standalone: true,
  imports: [CommonModule, LoadingSkeletonComponent],
  templateUrl: './skeleton-profile-card.component.html',
  styleUrls: ['./skeleton-profile-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonProfileCardComponent {
  @Input() showRole = true;
}
