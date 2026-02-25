export type { PlanEngine } from './types';
export { MockPlanEngine } from './MockPlanEngine';
export { HttpPlanEngine } from './HttpPlanEngine';

import { MockPlanEngine } from './MockPlanEngine';
import { HttpPlanEngine } from './HttpPlanEngine';
import type { PlanEngine } from './types';

const planApiUrl =
  typeof process !== 'undefined'
    ? (process.env.EXPO_PUBLIC_PLAN_API_URL || process.env.PLAN_API_URL)
    : '';

export function createPlanEngine(): PlanEngine {
  if (planApiUrl && planApiUrl.length > 0) {
    return new HttpPlanEngine(planApiUrl);
  }
  return new MockPlanEngine();
}
