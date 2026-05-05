import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TranslationService } from '../../../services/translation.service';
import { UIStateService } from '../../../services/ui-state.service';
import { ChatService } from '../../../services/chat.service';
import { StatusIndicatorComponent } from '../../ui/status-indicator/status-indicator';
import { TASK_TYPE_OPTIONS } from '../../../models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive, StatusIndicatorComponent, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  protected auth = inject(AuthService);
  protected translation = inject(TranslationService);
  protected uiState = inject(UIStateService);
  protected chat = inject(ChatService);

  protected taskTypeOptions = TASK_TYPE_OPTIONS;
}
