export interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface RecurringRule {
  id: string;
  name: string;
  description: string | null;
  frequency: 'WEEKLY' | 'MONTHLY';
  dayOfWeek: number;
  weekOfMonth: number | null;
  defaultCategoryId: string | null;
  defaultTitle: string | null;
  defaultCategory: Category | null;
}

export interface EventTemplate {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  isMandatory: boolean;
  defaultMonth: number | null;
  defaultDurationMinutes: number;
  defaultInvitationText: string | null;
  category: Category;
}

export interface PlannedEventDraft {
  id: string; // temporary client-side ID
  date: Date;
  endDate?: Date;
  title: string;
  description?: string;
  invitationText?: string;
  categoryId: string;
  category?: Category;
  templateId?: string;
  recurringRuleId?: string;
  isMandatory: boolean;
  source: 'recurring' | 'template' | 'manual';
  durationMinutes?: number;
}

export interface MandatoryEventPlacement {
  templateId: string;
  template: EventTemplate;
  date: Date | null;
  invitationText: string;
  isPlaced: boolean;
}

export interface WizardData {
  // Step 1: Year definition
  yearName: string;
  startDate: Date;
  endDate: Date;

  // Step 2: Recurring rules
  selectedRuleIds: string[];
  generatedEvents: PlannedEventDraft[];

  // Step 3: Mandatory templates
  mandatoryPlacements: MandatoryEventPlacement[];
  templateEvents: PlannedEventDraft[];

  // Step 4: Additional events
  additionalEvents: PlannedEventDraft[];

  // Step 5: Final options
  setAsActive: boolean;

  // Combined events for final review
  allEvents: PlannedEventDraft[];
}

export interface WizardInitialData {
  tenantId: string;
  categories: Category[];
  recurringRules: RecurringRule[];
  templates: EventTemplate[];
}

export const WIZARD_STEPS = [
  { number: 1, title: 'Lionsjahr definieren', description: 'Zeitraum festlegen' },
  { number: 2, title: 'Regeltermine', description: 'Wiederkehrende Termine' },
  { number: 3, title: 'Pflichttermine', description: 'Wichtige Events platzieren' },
  { number: 4, title: 'Weitere Termine', description: 'Zusätzliche Events' },
  { number: 5, title: 'Übersicht', description: 'Prüfen & Bestätigen' },
] as const;
