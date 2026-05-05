import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar';
import { BreadcrumbComponent } from '../../components/layout/breadcrumb/breadcrumb';
import { MessageListComponent } from '../../components/chat/message-list/message-list';
import { InputBarComponent } from '../../components/chat/input-bar/input-bar';
import { VisualizationPanelComponent } from '../../components/visualization/visualization-panel/visualization-panel';
import { TranslationService } from '../../services/translation.service';
import { UIStateService } from '../../services/ui-state.service';
import { HealthService } from '../../services/health.service';
import { PreferencesService } from '../../services/preferences.service';

@Component({
  selector: 'app-tutor',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    BreadcrumbComponent,
    MessageListComponent,
    InputBarComponent,
    VisualizationPanelComponent,
  ],
  templateUrl: './tutor.html',
  styleUrl: './tutor.scss',
})
export class TutorPage implements OnInit, OnDestroy {
  protected translation = inject(TranslationService);
  protected uiState = inject(UIStateService);
  private health = inject(HealthService);
  private preferences = inject(PreferencesService);

  protected helpSections = [
    { key: 'taskTypes', title: 'Task Types', icon: '○' },
    { key: 'uml', title: 'UML Diagrams', icon: '⬢' },
    { key: 'bpmn', title: 'BPMN Models', icon: '⬡' },
    { key: 'petriNet', title: 'Petri Nets', icon: '◉' },
  ];

  ngOnInit(): void {
    this.health.startPolling();
    this.preferences.load();
  }

  ngOnDestroy(): void {
    this.health.stopPolling();
  }

  getSectionLabel(id: string): string {
    return (this.translation.t().help.sections as Record<string, string>)[id] ?? id;
  }

  getTaskTypeHelp(key: string): string {
    return (this.translation.t().help.taskTypes as Record<string, string>)[key] ?? key;
  }
}
