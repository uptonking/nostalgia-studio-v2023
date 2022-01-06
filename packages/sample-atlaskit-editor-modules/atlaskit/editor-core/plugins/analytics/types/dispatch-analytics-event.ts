// import type { AnalyticsEventPayload } from './events';

type AnalyticsEventPayload = any;

export type DispatchAnalyticsEvent = (payload: AnalyticsEventPayload) => void;
