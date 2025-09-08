import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-skeleton-form-card',
  standalone: true,
  imports: [CommonModule, LoadingSkeletonComponent],
  templateUrl: './skeleton-form-card.component.html',
  styleUrls: ['./skeleton-form-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonFormCardComponent {}
