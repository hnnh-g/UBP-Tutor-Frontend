declare module 'bpmn-auto-layout' {
  /** Adds BPMN DI (diagram coordinates) to BPMN XML that has none. */
  export function layoutProcess(xml: string): Promise<string>;
}
