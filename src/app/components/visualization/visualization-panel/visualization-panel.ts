import { Component, ElementRef, inject, OnDestroy, signal, ViewChild, effect, computed } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { TranslationService } from '../../../services/translation.service';
import { UIStateService } from '../../../services/ui-state.service';
import { CommonModule } from '@angular/common';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import { encode } from 'plantuml-encoder';
import cytoscape from 'cytoscape';

@Component({
  selector: 'app-visualization-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualization-panel.html',
  styleUrl: './visualization-panel.scss',
})
export class VisualizationPanelComponent implements OnDestroy {
  protected chat = inject(ChatService);
  protected translation = inject(TranslationService);
  protected uiState = inject(UIStateService);

  @ViewChild('petriCanvas', { static: false })
  private petriCanvasRef!: ElementRef<HTMLDivElement>;
  private petriViewer?: cytoscape.Core;

  @ViewChild('canvas', {static: false})
  private canvasRef!: ElementRef<HTMLDivElement>;
  private viewer?: BpmnViewer;
  private readonly plantumlServer = 'http://localhost:8081';

  protected plantUmlUrl = computed(() => {
    const diagram = this.chat.currentDiagram();
    if (diagram?.type !== 'uml') return null;
    const encoded = encode(diagram.content);
    return `${this.plantumlServer}/svg/${encoded}`;
  });


  protected isRendering = signal(false);
  protected copySuccess = signal(false);
  protected panelHeight = signal(256);

  constructor() {
    effect(() => {
      const diagram = this.chat.currentDiagram();
      if (diagram) {
        this.uiState.expandVisualization();
        if (diagram.type === 'uml') this.panelHeight.set(400);
        if (diagram.type === 'petri-net') this.panelHeight.set(400);
      }
      if (diagram?.type === 'bpmn') {
        setTimeout(() => this.renderBpmn(diagram.content), 0);
      } else if (diagram?.type === 'petri-net') {
        setTimeout(() => this.renderPetriNet(diagram.content), 0);
      } else {
        this.destroyViewer();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyViewer();
  }

  private async renderBpmn(xml: string): Promise<void> {
    if (!this.canvasRef) return;
    if (!this.viewer) {
      this.viewer = new BpmnViewer({container: this.canvasRef.nativeElement});
    }
    this.isRendering.set(true);
    try {
      await this.viewer.importXML(xml);
      const canvas = this.viewer.get('canvas') as any;
      (this.viewer.get('canvas') as any).zoom('fit-viewport');

      const { inner } = canvas.viewbox();
      const containerWidth = this.canvasRef.nativeElement.offsetWidth;
      const natural = Math.round(containerWidth * (inner.height / inner.width));
      this.panelHeight.set(Math.min(600, Math.max(200, natural)));
    } catch (err) {
      console.error('BPMN render error', err);
    } finally {
      this.isRendering.set(false);
    }
  }

  private renderPetriNet(xml: string): void {
  if (!this.petriCanvasRef) return;

  this.petriViewer?.destroy();
  this.petriViewer = undefined;

  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const nodes: cytoscape.NodeDefinition[] = [];
  const edges: cytoscape.EdgeDefinition[] = [];

  doc.querySelectorAll('place').forEach(el => {
    const id = el.getAttribute('id')!;
    const label = el.querySelector('name > text')?.textContent ?? id;
    const marking = parseInt(el.querySelector('initialMarking > text')?.textContent ?? '0');
    const x = parseFloat(el.querySelector('graphics > position')?.getAttribute('x') ?? '0');
    const y = parseFloat(el.querySelector('graphics > position')?.getAttribute('y') ?? '0');
    nodes.push({ data: { id, label, type: 'place', marking }, ...(x || y ? { position: { x, y } } : {}) });
  });

  doc.querySelectorAll('transition').forEach(el => {
    const id = el.getAttribute('id')!;
    const label = el.querySelector('name > text')?.textContent ?? id;
    const x = parseFloat(el.querySelector('graphics > position')?.getAttribute('x') ?? '0');
    const y = parseFloat(el.querySelector('graphics > position')?.getAttribute('y') ?? '0');
    nodes.push({ data: { id, label, type: 'transition' }, ...(x || y ? { position: { x, y } } : {}) });
  });

  doc.querySelectorAll('arc').forEach(el => {
    edges.push({ data: {
      id: el.getAttribute('id')!,
      source: el.getAttribute('source')!,
      target: el.getAttribute('target')!,
    }});
  });

  const hasPositions = nodes.some(n => n.position);

  this.petriViewer = cytoscape({
    container: this.petriCanvasRef.nativeElement,
    elements: { nodes, edges },
    layout: hasPositions
      ? { name: 'preset' }
      : { name: 'breadthfirst', directed: true, padding: 30 } as any,
    style: [
      { selector: 'node[type="place"]', style: {
          'background-color': '#ffffff', 'border-color': '#334155', 'border-width': 2,
          shape: 'ellipse', width: 44, height: 44,
          label: 'data(label)', 'font-size': 11, 'text-valign': 'bottom', 'text-margin-y': 6, color: '#334155',
      }},
      { selector: 'node[type="place"][marking > 0]', style: { 'background-color': '#334155' }},
      { selector: 'node[type="transition"]', style: {
          'background-color': '#334155', shape: 'rectangle', width: 16, height: 44,
          label: 'data(label)', 'font-size': 11, 'text-valign': 'bottom', 'text-margin-y': 6, color: '#334155',
      }},
      { selector: 'edge', style: {
          width: 1.5, 'line-color': '#334155', 'target-arrow-color': '#334155',
          'target-arrow-shape': 'triangle', 'curve-style': 'bezier',
      }},
    ],
  });

  this.petriViewer.fit(undefined, 20);

  const bb = this.petriViewer.elements().boundingBox({});
  if (bb.w > 0 && bb.h > 0) {
    const containerWidth = this.petriCanvasRef.nativeElement.offsetWidth;
    const natural = Math.round(containerWidth * (bb.h / bb.w));
    this.panelHeight.set(Math.min(800, Math.max(350, natural)));
  }
}


  private destroyViewer(): void {
    this.viewer?.destroy();
    this.viewer = undefined;
    this.petriViewer?.destroy();
    this.petriViewer = undefined;
  }

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

  onPlantUmlError(event: Event): void {
    (event.target as HTMLImageElement).alt = 'Could not load diagram — is the PlantUML server running?';
  }

  onPlantUmlLoad(event: Event, container: HTMLElement): void {
    const img = event.target as HTMLImageElement;
    setTimeout(() => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      let height: number;
      if (nw > 0 && nh > 0) {
        const w = container.clientWidth || 600;
        height = Math.round(w * nh / nw);
      } else {
        height = img.offsetHeight;
      }
      if (height > 0) {
        this.panelHeight.set(Math.min(800, Math.max(200, height + 82)));
      }
    }, 0);
  }
}
