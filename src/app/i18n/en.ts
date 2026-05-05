export const en = {
  nav: {
    tutor: 'Tutor',
    settings: 'Settings',
    help: 'Help',
    admin: 'Admin',
    logout: 'Logout',
    login: 'Login',
  },
  welcome: {
    title: 'UBP Modeling Tutor',
    subtitle: 'Your AI-powered assistant for learning UML, Petri nets, and BPMN',
    description:
      'Get instant help with model generation, explanation, and evaluation from an intelligent tutor system.',
    loginButton: 'Login to get started',
    features: {
      generation: {
        title: 'Model Generation',
        description: 'Generate UML, BPMN, and Petri net diagrams from natural language descriptions.',
      },
      questions: {
        title: 'Modeling Explanations',
        description: 'Get clear explanations of complex modeling concepts and diagrams.',
      },
      evaluation: {
        title: 'Model Evaluation',
        description: 'Evaluate your diagrams for correctness, completeness, and best practices.',
      },
    },
  },
  tutor: {
    title: 'Modeling Tutor',
    placeholder: 'Ask a question or describe what you want to model...',
    send: 'Send',
    stop: 'Stop',
    upload: 'Upload file',
    newChat: 'New Chat',
    helpPanel: 'Help',
    emptyState: {
      title: 'Welcome to the UBP Modeling Tutor',
      subtitle: 'Choose a task type and start your conversation',
    },
  },
  taskType: {
    generation: 'Model Generation',
    evaluation: 'Model Evaluation',
    question: 'Question',
    summary: 'Summary',
    QAgeneration: 'Question Generation',
    label: 'Task type',
  },
  settings: {
    title: 'Settings',
    profile: 'Profile',
    preferences: 'Preferences',
    language: 'Language',
    defaultTaskType: 'Default task type',
    save: 'Save preferences',
    saved: 'Preferences saved',
    username: 'Username',
    email: 'Email',
    firstName: 'First name',
    lastName: 'Last name',
    roles: 'Roles',
  },
  help: {
    title: 'Help & Documentation',
    intro: 'Learn how to use the UBP Modeling Tutor effectively.',
    sections: {
      taskTypes: 'Task Types',
      uml: 'UML Diagrams',
      bpmn: 'BPMN Models',
      petriNet: 'Petri Nets',
      fileUpload: 'File Upload',
    },
    taskTypes: {
      description: 'The tutor supports four task types:',
      generation: 'Generate a new diagram from a text description.',
      evaluation: 'Have your diagram evaluated for correctness.',
      question: 'Ask any modeling-related question.',
      summary: 'Let the tutor generate a summary about a specific topic.',
      QAgeneration: 'Let the tutor generate exam questions (e.g., multiple choice, single choice, open questions).'
    },
    uml: {
      description:
        'UML (Unified Modeling Language) is a standardized modeling language for software systems.',
      types: 'Common diagram types: Class, Sequence, Use Case, Activity, State Machine.',
    },
    bpmn: {
      description:
        'BPMN (Business Process Model and Notation) is a standard for business process modeling.',
      elements: 'Key elements: Events, Activities, Gateways, Sequence Flows, Pools, Lanes.',
    },
    petriNet: {
      description:
        'Petri nets are mathematical modeling tools used to describe distributed systems.',
      elements: 'Components: Places, Transitions, Arcs, Tokens.',
    },
    fileUpload: {
      description: 'Upload existing diagram files for explanation or evaluation.',
      formats: 'Supported formats: .bpmn, .xml, .puml, .pnml',
      maxSize: 'Maximum file size: 10 MB',
    },
  },
  admin: {
    title: 'Admin Panel',
    users: 'User Management',
    systemStatus: 'System Status',
    logs: 'Activity Logs',
    noAccess: 'You do not have permission to access this page.',
  },
  status: {
    ready: 'Ready',
    generating: 'Generating...',
    error: 'Error',
  },
  language: {
    de: 'Deutsch',
    en: 'English',
    toggle: 'Language',
  },
  errors: {
    network: 'Network error. Please check your connection.',
    server: 'Server error. Please try again.',
    auth: 'Authentication failed. Please login again.',
    fileSize: 'File too large. Maximum size is 10 MB.',
    fileType: 'Invalid file type. Accepted: .bpmn, .xml, .puml, .pnml',
    timeout: 'Request timed out. Please try again.',
    cancelled: 'Generation cancelled.',
  },
  snackbar: {
    uploadSuccess: 'File uploaded successfully.',
    preferencesSaved: 'Preferences saved.',
    generationCancelled: 'Generation cancelled.',
  },
  visualization: {
    title: 'Diagram',
    loading: 'Rendering diagram...',
    expand: 'Expand',
    collapse: 'Collapse',
    download: 'Download',
    copy: 'Copy source',
    nodiagram: 'No diagram to display.',
    uml: 'UML Diagram',
    bpmn: 'BPMN Diagram',
    petriNet: 'Petri Net',
  },
  breadcrumb: {
    home: 'Home',
    tutor: 'Tutor',
    settings: 'Settings',
    help: 'Help',
    admin: 'Admin',
  },
  roles: {
    student: 'Student',
    teacher: 'Teacher',
    admin: 'Administrator',
  },
};

export type Translations = typeof en;
