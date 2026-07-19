// ==========================================================
// Central type definitions for WanderLove
// Every model & API payload should reuse these types so the
// app stays fully typed end-to-end (no `any`).
// ==========================================================

export enum Visibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PARTNER = 'partner'
}

export enum Mood {
  EXCITED = '😍',
  HAPPY = '😊',
  OKAY = '😐',
  BAD = '😡'
}

export enum ExpenseSplitRule {
  HALF = 'half',
  ME = 'me',
  PARTNER = 'partner'
}

export interface ICustomFieldDefinition {
  fieldName: string;
  fieldType: 'text' | 'number' | 'date';
}

export interface IPackingTemplate {
  name: string;
  items: string[];
}

export interface IThemePreference {
  primary: string;
  secondary: string;
  font: string;
}

export interface IUserPreferences {
  theme: IThemePreference;
  defaultCurrency: string;
  customCategories: string[];
  customActivityFields: ICustomFieldDefinition[];
  packingTemplates: IPackingTemplate[];
  defaultSplitRule: ExpenseSplitRule;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string; // hashed, never sent to client
  avatar?: string | null;
  coverImage?: string | null;
  bio?: string | null;
  partnerId?: string | null;
  partnerLinkCode?: string | null;
  preferences: IUserPreferences;
  createdAt: string;
  updatedAt: string;
}

// Safe user shape returned to the client (no password/link code)
export interface IPublicUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
  coverImage?: string | null;
  bio?: string | null;
  partnerId?: string | null;
  preferences: IUserPreferences;
}

export interface IActivity {
  _id: string;
  title: string;
  location: string;
  lat?: number;
  lng?: number;
  time: string; // '10:00 AM'
  date: string; // ISO string
  cost: number;
  currency: string;
  notes?: string;
  image?: string;
  mood?: Mood;
  category: string;
  isSurprise: boolean;
  paidBy?: string; // User ID
  customFields: Record<string, string>;
  order: number; // for drag & drop ordering within a day
}

export interface IDay {
  _id: string;
  date: string; // ISO string
  activities: IActivity[];
}

export interface IJournalEntry {
  _id: string;
  authorId: string;
  text: string;
  image?: string;
  createdAt: string;
}

export interface IPackingItem {
  item: string;
  isPacked: boolean;
}

export interface ITrip {
  _id: string;
  name: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  timezone: string;
  currency: string;
  totalBudget: number;
  coverImage?: string;
  visibility: Visibility;
  createdBy: string;
  isInstant: boolean;
  collaborators: string[];
  days: IDay[];
  sharedJournal: IJournalEntry[];
  packingChecklist: IPackingItem[];
  expenseSplitRule: ExpenseSplitRule;
  createdAt: string;
  updatedAt: string;
}

export interface ITemplateActivity {
  title: string;
  location: string;
  time: string;
  cost: number;
  category: string;
}

export interface ITemplate {
  _id: string;
  mood: string; // 'romantic' | 'adventure' | 'relax'
  destinationType: string; // 'beach' | 'mountain' | 'city'
  activities: ITemplateActivity[];
}

// ---------- Auth payloads ----------
export interface IJwtPayload {
  userId: string;
  email: string;
}

export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IPartnerAcceptInput {
  code: string;
}

// ---------- API response wrapper ----------
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
