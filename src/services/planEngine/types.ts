import type { Intake, Plan, LogEntry, RecoveryCheckin } from '../../types';

export interface PlanEngine {
  generatePlan(intake: Intake): Promise<Plan>;
  adjustPlan(
    intake: Intake,
    plan: Plan,
    logs: LogEntry[],
    checkins: RecoveryCheckin[]
  ): Promise<Plan>;
}
