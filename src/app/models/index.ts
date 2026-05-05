export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type Language = 'de' | 'en';
export type TaskType = 'generation' | 'evaluation' | 'question' | 'summary' | 'QAgeneration';
export type DiagramType = 'uml' | 'bpmn' | 'petri-net';
export type SystemStatus = 'ready' | 'generating' | 'error';
export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
}

export interface DiagramData {
  type: DiagramType;
  content: string;
  format?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  timestamp: Date;
  taskType?: TaskType;
  diagramData?: DiagramData;
  isStreaming?: boolean;
  uploadedFile?: UploadedFile;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content?: string;
}

export interface ChatRequest {
  message: string;
  taskType: TaskType;
  language: Language;
  uploadedFile?: UploadedFile;
  conversationId?: string;
}

export interface ChatResponse {
  id: string;
  content: string;
  taskType: TaskType;
  diagramData?: DiagramData;
  conversationId: string;
}

export interface UserPreferences {
  language: Language;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  defaultTaskType: TaskType;
}

export interface SnackbarMessage {
  id: string;
  type: SnackbarType;
  message: string;
  duration?: number;
}

export interface HealthResponse {
  status: SystemStatus;
  message?: string;
  timestamp?: string;
}

export interface TaskTypeOption {
  value: TaskType;
  labelKey: string;
  icon: string;
  placeholders: string[];
}

export const TASK_TYPE_OPTIONS: TaskTypeOption[] = [
  {
    value: 'generation',
    labelKey: 'taskType.generation',
    icon: '✦',
    placeholders: [
      'Create a BPMN diagram for an order process...',
      'Generate a UML class diagram for a library system...',
      'Model a Petri net for a traffic light...',
    ],
  },
  {
    value: 'evaluation',
    labelKey: 'taskType.evaluation',
    icon: '◎',
    placeholders: [
      'Evaluate this UML class diagram for correctness...',
      'Check this BPMN model for best practices...',
      'Is my Petri net deadlock-free?',
    ],
  },
  {
    value: 'question',
    labelKey: 'taskType.question',
    icon: '○',
    placeholders: [
      'What is the difference between BPMN and UML?',
      'How do I model concurrency in a Petri net?',
      'When should I use a sequence diagram?',
    ],
  },
  {
    value: 'summary',
    labelKey: 'taskType.summary',
    icon: '◈',
    placeholders: [
      'Summarize the components of a BPMN diagram.',
      'Sumarize the UML diagram types.',
    ],
  },
  {
    value: 'QAgeneration',
    labelKey: 'taskType.QAgeneration',
    icon: '∆',
    placeholders: [
      'Generate 5 multiple choice questions.',
      'Create 3 single choice and 3 multiple choice questions related to UML.',
      'Create exam questions for Petri nets.',
    ],
  },
];

export const ACCEPTED_FILE_TYPES = ['.bpmn', '.xml', '.puml', '.pnml'];
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const GENERATION_KEYWORDS = ['create', 'generate', 'make', 'build', 'draw', 'erstelle', 'generiere', 'zeichne'];
export const EXPLANATION_KEYWORDS = ['explain', 'what is', 'describe', 'show me', 'erkläre', 'was ist', 'beschreibe', 'define', 'definiere'];
export const SUMMARY_KEYWORDS = ['summary', 'zusammenfassungen']
export const QUESTION_GENERATION = ['questions', 'fragen', 'nutzerantwort', 'user query', 'multiple choice', 'single choice'];
export const EVALUATION_KEYWORDS = ['evaluate', 'check', 'review', 'validate', 'assess', 'bewerte', 'prüfe', 'überprüfe'];

export function detectTaskType(text: string): TaskType | null {
  const lower = text.toLowerCase();
  if (GENERATION_KEYWORDS.some((k) => lower.includes(k))) return 'generation';
  if (EXPLANATION_KEYWORDS.some((k) => lower.includes(k))) return 'question';
  if (SUMMARY_KEYWORDS.some((k) => lower.includes(k))) return 'summary';
  if (QUESTION_GENERATION.some((k) => lower.includes(k))) return 'QAgeneration';
  if (EVALUATION_KEYWORDS.some((k) => lower.includes(k))) return 'evaluation';
  return null;
}
