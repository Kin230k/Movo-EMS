// components/shared/button/button.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'themed-button',
  imports: [CommonModule],
  templateUrl: './themed-button.html',
  styleUrl: './themed-button.scss',
  standalone: true,
})
export class ThemedButtonComponent {
  @Input() type: string = 'button';
  @Input() text: string = '';
  @Output() onClick = new EventEmitter<void>();
}
