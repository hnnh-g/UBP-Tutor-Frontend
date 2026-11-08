import { Component, ElementRef, inject, OnDestroy, signal, ViewChild, effect, computed } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { TranslationService } from '../../../services/translation.service';
import { UIStateService } from '../../../services/ui-state.service';
import { CommonModule } from '@angular/common';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import { layoutProcess } from 'bpmn-auto-layout';
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

  private _petriCanvasRef?: ElementRef<HTMLDivElement>;
  @ViewChild('petriCanvas', { static: false })
  set petriCanvasRef(ref: ElementRef<HTMLDivElement>) {
    this._petriCanvasRef = ref;
    if (ref) {
      const diagram = this.chat.currentDiagram();
      if (diagram?.type === 'petri-net') {
        setTimeout(() => this.renderPetriNet(diagram.content), 0);
      }
    }
  }
  private petriViewer?: cytoscape.Core;
  private petriResizeObserver?: ResizeObserver;

  private _canvasRef?: ElementRef<HTMLDivElement>;
  @ViewChild('canvas', {static: false})
  set canvasRef(ref: ElementRef<HTMLDivElement>) {
    this._canvasRef = ref;
    if (ref) {
      const diagram = this.chat.currentDiagram();
      if (diagram?.type === 'bpmn') {
        setTimeout(() => this.renderBpmn(diagram.content), 0);
      }
    }
  }
  private viewer?: BpmnViewer;
  private bpmnResizeObserver?: ResizeObserver;
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
        if (diagram.type === 'bpmn') this.panelHeight.set(400);
        if (diagram.type === 'petri-net') this.panelHeight.set(400);
      }
      if (diagram?.type === 'bpmn') {
        this.petriViewer?.destroy();
        this.petriViewer = undefined;
        if (this._canvasRef) setTimeout(() => this.renderBpmn(diagram.content), 0);
      } else if (diagram?.type === 'petri-net') {
        this.bpmnResizeObserver?.disconnect();
        this.bpmnResizeObserver = undefined;
        this.viewer?.destroy();
        this.viewer = undefined;
        if (this._petriCanvasRef) setTimeout(() => this.renderPetriNet(diagram.content), 0);
      } else {
        this.destroyViewer();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyViewer();
  }

  private preprocessBpmnXml(xml: string): string {
    // Correction for when backend emits wrong namespace URIs for dc: and di: prefixes
    xml = xml.replace(
      /xmlns:dc="http:\/\/www\.omg\.org\/spec\/BPMN\/20100524\/DC"/g,
      'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"',
    );
    xml = xml.replace(
      /xmlns:di="http:\/\/www\.omg\.org\/spec\/BPMN\/20100524\/DI"/g,
      'xmlns:di="http://www.omg.org/spec/DD/20100524/DI"',
    );
    // Add bpmnElement to BPMNPlane if missing (required by bpmn-js)
    if (/<bpmndi:BPMNPlane(?![^>]*bpmnElement)/.test(xml)) {
      const processMatch = xml.match(/<bpmn:process[^>]+id="([^"]+)"/);
      if (processMatch) {
        xml = xml.replace(
          /<bpmndi:BPMNPlane(?![^>]*bpmnElement)/,
          `<bpmndi:BPMNPlane bpmnElement="${processMatch[1]}"`,
        );
      }
    }
    return xml;
  }

  private async renderBpmn(xml: string): Promise<void> {
    if (!this._canvasRef) return;
    if (this._canvasRef.nativeElement.offsetWidth === 0) {
      requestAnimationFrame(() => this.renderBpmn(xml));
      return;
    }
    if (!this.viewer) {
      this.viewer = new BpmnViewer({container: this._canvasRef.nativeElement});
      // Re-fit whenever the panel changes size (height animation, window resize,
      // sidebar/help toggle) - otherwise the zoom stays tuned to the old size.
      this.bpmnResizeObserver?.disconnect();
      this.bpmnResizeObserver = new ResizeObserver(() => this.fitBpmn());
      this.bpmnResizeObserver.observe(this._canvasRef.nativeElement);
    }
    this.isRendering.set(true);
    try {
      let ready = this.preprocessBpmnXml(xml);
      // The fine-tuned model emits BPMN with no <bpmndi:BPMNDiagram> section -
      // 0 of its 74 BPMN training examples contain one - and BpmnViewer only
      // draws shapes at DI coordinates, so without DI the panel stays blank.
      // Generating the layout here is deterministic; the coordinates the model
      // invents when asked for DI are overlapping and frequently wrong.
      if (!/BPMNDiagram/.test(ready)) {
        try {
          ready = await layoutProcess(ready);
        } catch (layoutErr) {
          // Pools/collaborations are only partly supported by bpmn-auto-layout;
          // fall through so bpmn-js reports the underlying problem itself.
          console.error('BPMN auto-layout failed', layoutErr);
        }
      }
      await this.viewer.importXML(ready);
      const canvas = this.viewer.get('canvas') as any;
      canvas.zoom('fit-viewport', 'auto');
      const { inner } = canvas.viewbox();
      const containerWidth = this._canvasRef.nativeElement.offsetWidth;
      // Height the diagram needs at full width (never zoom in beyond 100%),
      const scale = Math.min(1, containerWidth / inner.width);
      const natural = Math.round(inner.height * scale) + 41 + 32 + 40;
      this.panelHeight.set(Math.max(350, natural));
    } catch (err) {
      console.error('BPMN render error', err);
    } finally {
      this.isRendering.set(false);
    }
  }

  private fitBpmn(): void {
    if (!this.viewer || !this._canvasRef?.nativeElement.offsetHeight) return;
    try {
      const canvas = this.viewer.get('canvas') as any;
      canvas.resized();
      canvas.zoom('fit-viewport', 'auto');
      // Don't blow small diagrams up beyond their natural size.
      if (canvas.zoom() > 1) canvas.zoom(1, 'auto');
    } catch {
      // viewer not ready / no diagram imported yet
    }
  }

  private renderPetriNet(xml: string): void {
  if (!this._petriCanvasRef) return;
  if (this._petriCanvasRef.nativeElement.offsetWidth === 0) {
    requestAnimationFrame(() => this.renderPetriNet(xml));
    return;
  }

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
    container: this._petriCanvasRef.nativeElement,
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

  // Re-fit when the panel is resized (e.g. shrunk to the available space).
  this.petriResizeObserver?.disconnect();
  this.petriResizeObserver = new ResizeObserver(() => {
    this.petriViewer?.resize();
    this.petriViewer?.fit(undefined, 20);
  });
  this.petriResizeObserver.observe(this._petriCanvasRef.nativeElement);

  const bb = this.petriViewer.elements().boundingBox({});
  if (bb.w > 0 && bb.h > 0) {
    const containerWidth = this._petriCanvasRef.nativeElement.offsetWidth;
    // bb is in model coordinates (zoom 1); never size for more than 100% zoom.
    const scale = Math.min(1, containerWidth / bb.w);
    const natural = Math.round(bb.h * scale) + 41 + 32 + 40;
    this.panelHeight.set(Math.max(350, natural));
  }
}


  private destroyViewer(): void {
    this.bpmnResizeObserver?.disconnect();
    this.bpmnResizeObserver = undefined;
    this.viewer?.destroy();
    this.viewer = undefined;
    this.petriResizeObserver?.disconnect();
    this.petriResizeObserver = undefined;
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
        this.panelHeight.set(Math.max(200, height + 82));
      }
    }, 0);
  }
}
