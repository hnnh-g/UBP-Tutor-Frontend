import type { Translations } from './en';

export const de: Translations = {
  nav: {
    tutor: 'Tutor',
    settings: 'Einstellungen',
    help: 'Hilfe',
    admin: 'Admin',
    logout: 'Abmelden',
    login: 'Anmelden',
  },
  welcome: {
    title: 'UBP Modellierungstutor',
    subtitle: 'Ihr KI-gestützter Assistent für UML, Petri-Netze und BPMN',
    description:
      'Erhalten Sie sofortige Hilfe bei der Modellerstellung, Erklärung und Bewertung durch ein intelligentes Tutorsystem.',
    loginButton: 'Jetzt anmelden',
    features: {
      generation: {
        title: 'Modellerstellung',
        description: 'Erstellen Sie UML-, BPMN- und Petri-Netz-Diagramme aus natürlichsprachlichen Beschreibungen.',
      },
      questions: {
        title: 'Erklärung von Modellierungskonzepten',
        description: 'Erhalten Sie klare Erklärungen komplexer Modellierungskonzepte und -diagramme.',
      },
      evaluation: {
        title: 'Modellbewertung',
        description: 'Lassen Sie Ihre Diagramme auf Korrektheit, Vollständigkeit und Best Practices prüfen.',
      },
    },
  },
  tutor: {
    title: 'Modellierungstutor',
    placeholder: 'Stellen Sie eine Frage oder beschreiben Sie, was Sie modellieren möchten...',
    send: 'Senden',
    stop: 'Stoppen',
    upload: 'Datei hochladen',
    newChat: 'Neuer Chat',
    helpPanel: 'Hilfe',
    emptyState: {
      title: 'Willkommen beim UBP Modellierungstutor',
      subtitle: 'Wählen Sie einen Aufgabentyp und beginnen Sie Ihr Gespräch',
      suggestions: [
        'Erstelle ein BPMN-Diagramm für einen Bestellprozess',
        'Erkläre UML-Klassendiagramme',
        'Bewerte dieses Petri-Netz-Modell',
        'Was ist ein Sequenzdiagramm?'
      ],
    },
    dynamicPlaceholders: {
      generation: [
        'Erstelle ein BPMN-Diagramm für einen Bestellprozess...',
        'Generiere ein UML-Klassendiagramm für ein Bibliothekssystem...',
        'Modelliere ein Petri-Netz für eine Ampel...',
      ],
      evaluation: [
        'Bewerte dieses UML-Klassendiagramm auf Korrektheit...',
        'Überprüfe dieses BPMN-Modell auf Best Practices...',
        'Ist mein Petri-Netz frei von Deadlocks?',
      ],
      question: [
        'Was ist der Unterschied zwischen BPMN und UML?',
        'Wie modelliere ich Nebenläufigkeit in einem Petri-Netz?',
        'Wann sollte ich ein Sequenzdiagramm verwenden?',
      ],
      summary: [
        'Fasse die Komponenten eines BPMN-Diagramms zusammen.',
        'Fasse die UML-Diagrammtypen zusammen.',
      ],
      QAgeneration: [
        'Generiere 5 Multiple-Choice-Fragen.',
        'Erstelle 3 Single-Choice- und 3 Multiple-Choice-Fragen zu UML.',
        'Erstelle Prüfungsfragen für Petri-Netze.',
      ],
    },
  },
  taskType: {
    generation: 'Modellerstellung',
    evaluation: 'Modellbewertung',
    question: 'Frage',
    summary: 'Zusammenfassungen',
    QAgeneration: 'Fragen-Erstellung',
    label: 'Aufgabentyp',
  },
  settings: {
    title: 'Einstellungen',
    profile: 'Profil',
    preferences: 'Präferenzen',
    language: 'Sprache',
    defaultTaskType: 'Standard-Aufgabentyp',
    save: 'Präferenzen speichern',
    saved: 'Präferenzen gespeichert',
    username: 'Benutzername',
    email: 'E-Mail',
    firstName: 'Vorname',
    lastName: 'Nachname',
    roles: 'Rollen',
  },
  help: {
    title: 'Hilfe & Dokumentation',
    intro: 'Lernen Sie, den UBP Modellierungstutor effektiv zu nutzen.',
    sections: {
      taskTypes: 'Aufgabentypen',
      uml: 'UML-Diagramme',
      bpmn: 'BPMN-Modelle',
      petriNet: 'Petri-Netze',
      fileUpload: 'Datei-Upload',
    },
    taskTypes: {
      description: 'Der Tutor unterstützt 5 Aufgabentypen:',
      generation: 'Erstellen Sie ein neues Diagramm aus einer Textbeschreibung.',
      evaluation: 'Lassen Sie Ihr Diagramm auf Korrektheit prüfen.',
      question: 'Stellen Sie eine beliebige Frage zur Modellierung.',
      summary: 'Lassen Sie sich Zusammenfassungen zu bestimmten Themen erstellen.',
      QAgeneration: 'Lassen Sie sich Prüfungsfragen in folgenden Formaten erstellen (Multiple Choice, Single Choice oder offene Fragen)',
    },
    uml: {
      description:
        'UML (Unified Modeling Language) ist eine standardisierte Modellierungssprache für Softwaresysteme.',
      types: 'Häufige Diagrammtypen: Klassen-, Sequenz-, Anwendungsfall-, Aktivitäts-, Zustandsdiagramm.',
    },
    bpmn: {
      description:
        'BPMN (Business Process Model and Notation) ist ein Standard für die Geschäftsprozessmodellierung.',
      elements: 'Schlüsselelemente: Ereignisse, Aktivitäten, Gateways, Sequenzflüsse, Pools, Lanes.',
    },
    petriNet: {
      description:
        'Petri-Netze sind mathematische Modellierungswerkzeuge zur Beschreibung verteilter Systeme.',
      elements: 'Komponenten: Stellen, Transitionen, Kanten, Marken.',
    },
    fileUpload: {
      description: 'Laden Sie vorhandene Diagrammdateien zur Erklärung oder Bewertung hoch.',
      formats: 'Unterstützte Formate: .bpmn, .xml, .puml, .pnml',
      maxSize: 'Maximale Dateigröße: 10 MB',
    },
  },
  admin: {
    title: 'Admin-Bereich',
    users: 'Benutzerverwaltung',
    systemStatus: 'Systemstatus',
    logs: 'Aktivitätsprotokolle',
    noAccess: 'Sie haben keine Berechtigung, auf diese Seite zuzugreifen.',
  },
  status: {
    ready: 'Bereit',
    generating: 'Generierung läuft...',
    error: 'Fehler',
  },
  language: {
    de: 'Deutsch',
    en: 'English',
    toggle: 'Sprache',
  },
  errors: {
    network: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.',
    server: 'Serverfehler. Bitte versuchen Sie es erneut.',
    auth: 'Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.',
    fileSize: 'Datei zu groß. Maximale Größe: 10 MB.',
    fileType: 'Ungültiger Dateityp. Akzeptiert: .bpmn, .xml, .puml, .pnml',
    timeout: 'Zeitüberschreitung. Bitte versuchen Sie es erneut.',
    cancelled: 'Generierung abgebrochen.',
  },
  snackbar: {
    uploadSuccess: 'Datei erfolgreich hochgeladen.',
    preferencesSaved: 'Präferenzen gespeichert.',
    generationCancelled: 'Generierung abgebrochen.',
  },
  visualization: {
    title: 'Diagramm',
    loading: 'Diagramm wird gerendert...',
    expand: 'Erweitern',
    collapse: 'Verkleinern',
    download: 'Herunterladen',
    copy: 'Quellcode kopieren',
    nodiagram: 'Kein Diagramm vorhanden.',
    uml: 'UML-Diagramm',
    bpmn: 'BPMN-Diagramm',
    petriNet: 'Petri-Netz',
  },
  breadcrumb: {
    home: 'Startseite',
    tutor: 'Tutor',
    settings: 'Einstellungen',
    help: 'Hilfe',
    admin: 'Admin',
  },
  roles: {
    student: 'Student',
    teacher: 'Lehrkraft',
    admin: 'Administrator',
  },
};
