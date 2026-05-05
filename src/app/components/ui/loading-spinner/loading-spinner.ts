import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss',
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() label = 'Loading...';
  @Input() overlay = false;

  get sizeClass(): string {
    return { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[this.size];
  }
}
