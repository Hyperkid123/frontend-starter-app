import React, { useEffect, useState } from 'react';
import {
  DataViewTable,
  DataViewTh,
  DataViewTr,
} from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { useActiveConversation } from '@redhat-cloud-services/ai-react-state';
import { updateContext } from '../api';
import { ClusterData, ClusterHitsRisk } from './common';

const CLUSTERS_PATH = '/api/insights-results-aggregator/v2/clusters';

type ClustersResponse = {
  data: ClusterData[];
  meta: {
    count: number;
  };
  status: string;
};

type IssueLevels = 'low' | 'medium' | 'high' | 'critical';

const issueLevelMap: Record<IssueLevels, keyof ClusterHitsRisk> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

async function getClusters(issueLevels: IssueLevels[]) {
  const response = await fetch(CLUSTERS_PATH);
  if (!response.ok) {
    throw new Error('Failed to fetch clusters');
  }
  const { data }: ClustersResponse = await response.json();
  const validLevels = issueLevels.reduce<(keyof ClusterHitsRisk)[]>(
    (acc, level) => {
      const levelValue = issueLevelMap[level];
      if (levelValue) {
        acc.push(levelValue);
      }
      return acc;
    },
    [],
  );
  return data.filter((cluster) => {
    return validLevels.some((level) => {
      return cluster.hits_by_total_risk[level] > 0;
    });
  });
}

const ClusterOverview = ({
  issueLevels,
  contextId,
}: {
  issueLevels: IssueLevels[];
  contextId: string;
}) => {
  const activeConversation = useActiveConversation();
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  async function handleInit() {
    const data = await getClusters(issueLevels);
    setClusters(data);
    console.log(activeConversation);
    if (activeConversation) {
      updateContext({
        conversation_id: activeConversation.id,
        contextId,
        contextData: {
          clusters: data,
          issueLevels,
        },
      });
    }
  }

  useEffect(() => {
    handleInit();
  }, [issueLevels]);

  const columns: DataViewTh[] = ['Name', 'Version', 'Critical', 'Important'];
  const rows: DataViewTr[] = clusters.map((cluster) => [
    cluster.cluster_name,
    cluster.cluster_version,
    cluster.hits_by_total_risk[4],
    cluster.hits_by_total_risk[3],
  ]);

  return <DataViewTable columns={columns} rows={rows} />;
};

export default ClusterOverview;
