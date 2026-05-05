import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../services/chat.service';
import { TranslationService } from '../../../services/translation.service';
import { UIStateService } from '../../../services/ui-state.service';

@Component({
  selector: 'app-visualization-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualization-panel.html',
  styleUrl: './visualization-panel.scss',
})
export class VisualizationPanelComponent {
  protected chat = inject(ChatService);
  protected translation = inject(TranslationService);
  protected uiState = inject(UIStateService);

  protected isRendering = signal(false);
  protected copySuccess = signal(false);

  get diagramTypeLabel(): string {
    const t = this.translation.t().visualization;
    const type = this.chat.currentDiagram()?.type;
    if (type === 'bpmn') return t.bpmn;
    if (type === 'petri-net') return t.petriNet;
    return t.uml;
  }

  get diagramIcon(): string {
    const type = this.chat.currentDiagram()?.type;
    if (type === 'bpmn') return '⬡';
    if (type === 'petri-net') return '◉';
    return '⬢';
  }

  copySource(): void {
    const content = this.chat.currentDiagram()?.content;
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    });
  }

  downloadDiagram(): void {
    const diagram = this.chat.currentDiagram();
    if (!diagram) return;
    const ext = diagram.type === 'bpmn' ? '.bpmn' : diagram.type === 'uml' ? '.puml' : '.pnml';
    const blob = new Blob([diagram.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
