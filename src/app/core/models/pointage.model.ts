export interface PointageRequest {
  date: string;
  present: boolean;
  motif?: string;
}

export interface PointageResponse {
  id: number;
  stageId: number;
  date: string;
  present: boolean;
  motif?: string;
}

export interface PointageBulkRequest {
  stageId: number;
  pointages: PointageRequest[];
}
