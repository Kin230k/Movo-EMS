import { Component } from '@angular/core';
import { SkeletonProfileCardComponent } from '../skeleton-profile-card/skeleton-profile-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-list-skeletion',
  imports: [CommonModule, SkeletonProfileCardComponent],
  templateUrl: './card-list-skeletion.component.html',
  styleUrl: './card-list-skeletion.component.scss',
})
export class CardListSkeletionComponent {}
