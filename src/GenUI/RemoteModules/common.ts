export type ClusterHitsRisk = {
  // low
  1: number;
  // medium
  2: number;
  // high
  3: number;
  // critical
  4: number;
};

export type ClusterData = {
  cluster_id: string;
  cluster_name: string;
  cluster_version: string;
  hits_by_total_risk: ClusterHitsRisk;
  total_hit_count: number;
};
