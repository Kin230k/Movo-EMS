import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonFormCardComponent } from '../skeleton-form-card/skeleton-form-card.component';

@Component({
  selector: 'app-form-list-skeleton',
  imports: [CommonModule, SkeletonFormCardComponent],
  templateUrl: './form-list-skeleton.component.html',
  styleUrl: './form-list-skeleton.component.scss',
})
export class FormListSkeletonComponent {}
