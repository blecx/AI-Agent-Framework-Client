export type ReadinessState =
  | "notAssessed"
  | "inProgress"
  | "pass"
  | "warn"
  | "fail";

export interface ReadinessCheck {
  id: string;
  status: ReadinessState;
  actionKey?: string;
  actionUrl?: string;
}

export interface ReadinessSummary {
  passed: number;
  warnings: number;
  failed: number;
  notAssessed: number;
  inProgress: number;
}

export interface ProjectReadiness {
  overallStatus: ReadinessState;
  checks: ReadinessCheck[];
  summary: ReadinessSummary;
}
