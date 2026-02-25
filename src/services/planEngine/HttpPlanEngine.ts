import type { PlanEngine } from './types';
import type { Intake, Plan, LogEntry, RecoveryCheckin } from '../../types';
import { planSchema } from '../../types';

const getBaseUrl = (): string => {
  const url = process.env.EXPO_PUBLIC_PLAN_API_URL || process.env.PLAN_API_URL;
  if (!url) throw new Error('Plan API URL not set (EXPO_PUBLIC_PLAN_API_URL or PLAN_API_URL)');
  return url.replace(/\/$/, '');
};

export class HttpPlanEngine implements PlanEngine {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? getBaseUrl();
  }

  async generatePlan(intake: Intake): Promise<Plan> {
    const res = await fetch(`${this.baseUrl}/generatePlan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intake }),
    });
    if (!res.ok) throw new Error(`generatePlan failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    const parsed = planSchema.safeParse(json);
    if (!parsed.success) throw new Error('Invalid plan response: ' + parsed.error.message);
    return parsed.data;
  }

  async adjustPlan(
    intake: Intake,
    plan: Plan,
    logs: LogEntry[],
    checkins: RecoveryCheckin[]
  ): Promise<Plan> {
    const res = await fetch(`${this.baseUrl}/adjustPlan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intake, plan, logs, checkins }),
    });
    if (!res.ok) throw new Error(`adjustPlan failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    const parsed = planSchema.safeParse(json);
    if (!parsed.success) throw new Error('Invalid plan response: ' + parsed.error.message);
    return parsed.data;
  }
}
