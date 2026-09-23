export type Tier = "now" | "next" | "later" | "fyi" | "done";
export type Status = "open" | "in_progress" | "waiting" | "snoozed" | "done";
export type Source =
  | "order"
  | "system"
  | "comms"
  | "carrier"
  | "customer"
  | "inventory"
  | "safety"
  | "compliance"
  | "floor"
  | "fyi";
export type CustomerImpact = "none" | "low" | "high";
export type PersonStatus = "working" | "on_break" | "out";
export type UpdateType = "activity" | "system" | "announcement" | "handoff";

export interface Item {
  id: string;
  title: string;
  source: Source;
  assigneeId: string | null;
  dueAt: string | null;
  createdAt: string;
  cutoffId: string | null;
  ordersBlocked: number;
  unitsAffected: number;
  customerImpact: CustomerImpact;
  safety: boolean;
  compliance: boolean;
  escalated: boolean;
  cause: string;
  whyText: string;
  primaryAction: string;
  status: Status;
  waitingOn?: string;
  checkBackAt?: string;
  snoozeUntil?: string;
  helpAsked?: boolean;
  helpReason?: string;
  helpNote?: string;
  notMineCount?: number;
  _expected?: { score: number | null; tier: Tier };
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  role: string;
  area: string;
  isManager: boolean;
  status: PersonStatus;
  statusNote: string | null;
  currentTaskId: string | null;
  currentTaskStartedAt: string | null;
  needsHelpSignal?: string;
}

export interface Cutoff {
  id: string;
  carrier: string;
  door: string;
  departsAt: string;
  ordersPlanned: number;
  ordersAtRisk: number;
}

export interface UpdateEntry {
  id: string;
  at: string;
  authorId: string | null;
  type: UpdateType;
  text: string;
}

export interface DoneEntry {
  id: string;
  assigneeId: string;
  title: string;
  doneAt: string;
}

export interface ScoreFactors {
  T: number;
  B: number;
  I: number;
  overdue: boolean;
  minutesLeft: number | null;
}
