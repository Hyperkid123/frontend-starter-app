import React, { useEffect, useState } from 'react';
import {
  DataViewTable,
  DataViewTh,
  DataViewTr,
} from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { AnimatedTableContainer, createAnimatedCell } from '../AnimationUtils';
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
  componentId,
}: {
  issueLevels: IssueLevels[];
  contextId: string;
  componentId: string;
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

  const columns: DataViewTh[] = [
    { cell: 'Name', props: { key: `${componentId}-header-name` } },
    { cell: 'Version', props: { key: `${componentId}-header-version` } },
    { cell: 'Critical', props: { key: `${componentId}-header-critical` } },
    { cell: 'Important', props: { key: `${componentId}-header-important` } },
  ];
  const rows: DataViewTr[] = clusters.map((cluster, index) => [
    createAnimatedCell(
      cluster.cluster_name,
      index,
      0,
      `${cluster.cluster_name}-name`,
    ),
    createAnimatedCell(
      cluster.cluster_version,
      index,
      1,
      `${cluster.cluster_name}-version`,
    ),
    createAnimatedCell(
      cluster.hits_by_total_risk[4],
      index,
      2,
      `${cluster.cluster_name}-critical`,
    ),
    createAnimatedCell(
      cluster.hits_by_total_risk[3],
      index,
      3,
      `${cluster.cluster_name}-important`,
    ),
  ]);

  return (
    <AnimatedTableContainer componentId={componentId}>
      <DataViewTable columns={columns} rows={rows} />
    </AnimatedTableContainer>
  );
};

export default ClusterOverview;
