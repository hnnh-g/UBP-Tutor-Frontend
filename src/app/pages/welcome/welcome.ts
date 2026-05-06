import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class WelcomePage {
  protected auth = inject(AuthService);
  protected translation = inject(TranslationService);
  private router = inject(Router);

  login(): void {
    this.auth.login();
  }

  getFeature(key: string): { title: string; description: string } {
    return (this.translation.t().welcome.features as Record<string, { title: string; description: string }>)[key]
      ?? { title: key, description: '' };
  }
}
