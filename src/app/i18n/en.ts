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
      model_generation: {
        title: 'Model Generation',
        description: 'Generate UML, BPMN, and Petri net diagrams from natural language descriptions.',
      },
      question: {
        title: 'Modeling Explanations',
        description: 'Get clear explanations of complex modeling concepts and diagrams.',
      },
      model_evaluation: {
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
      suggestions: [
        'Create a BPMN diagram for an order process',
        'Explain UML class diagrams',
        'Evaluate this Petri net model',
        'What is a sequence diagram?'
      ],
    },
    dynamicPlaceholders: {
      model_generation: [
        'Create a BPMN diagram for an order process...',
        'Generate a UML class diagram for a library system...',
        'Model a Petri net for a traffic light...',
      ],
      model_evaluation: [
        'Evaluate this UML class diagram for correctness...',
        'Check this BPMN model for best practices...',
        'Is my Petri net deadlock-free?',
      ],
      question: [
        'What is the difference between BPMN and UML?',
        'How do I model concurrency in a Petri net?',
        'When should I use a sequence diagram?',
      ],
      summary: [
        'Summarize the components of a BPMN diagram.',
        'Summarize the UML diagram types.',
      ],
      question_generation: [
        'Generate 5 multiple choice questions.',
        'Create 3 single choice and 3 multiple choice questions related to UML.',
        'Create exam questions for Petri nets.',
      ],
      answer_evaluation: [
        'Evaluate the answer for correctness and completeness.',
        'Provide feedback on the answer and suggest improvements.',
      ]
    },
  },
  taskType: {
    model_generation: 'Model Generation',
    model_evaluation: 'Model Evaluation',
    question: 'Question',
    summary: 'Summary',
    question_generation: 'Question Generation',
    answer_evaluation: 'Answer Evaluation',
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
      description: 'The tutor supports 6 task types:',
      model_generation: 'Generate a new diagram from a text description.',
      model_evaluation: 'Have your diagram evaluated for correctness.',
      question: 'Ask any modeling-related question.',
      summary: 'Let the tutor generate a summary about a specific topic.',
      question_generation: 'Let the tutor generate exam questions (e.g., multiple choice, single choice, open questions).',
      answer_evaluation: 'Have your answers evaluated and receive feedback.'
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
    subtitle: 'System administration and monitoring.',
    users: 'User Management',
    systemStatus: 'System Status',
    availableAgents: 'Available Agents',
    logs: 'Activity Logs',
    noAccess: 'You do not have permission to access this page.',
    totalUsers: 'Total Users',
    activeSessions: 'Active Sessions',
    activeRequests: 'Active Requests',
    activeModel: 'Active Model',
    streaming: 'Streaming',
    active: 'Active',
    inactive: 'Inactive',
    reachable: 'Reachable',
    unreachable: 'Unreachable',
    loading: 'Loading…',
    errorLoading: 'Could not load data.',
    noComponentData: 'No component data.',
    total: 'total',
    enabled: 'Enabled',
    disabled: 'Disabled',
  },
  status: {
    ready: 'Ready',
    something_is_wrong: 'One component fails...',
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
    generationFailed: 'Something went wrong and the model could not generate a response. Please try again.',
    diagramFailed: 'The model could not produce a diagram for your request. Try rephrasing or providing more detail.',
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
