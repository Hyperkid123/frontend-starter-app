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
import { Label, Button, Tooltip } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';

const CLUSTERS_PATH = '/api/insights-results-aggregator/v2/clusters';

type ClustersResponse = {
  data: ClusterData[];
  meta: {
    count: number;
  };
  status: string;
};

type IssueLevels = 'low' | 'medium' | 'high' | 'critical';

type PredictionResponse = {
  status: string;
  predictions: {
    cluster_id: string;
    upgrade_recommended: boolean;
  }[];
};

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

  const requiredClusters = data.filter((cluster) => {
    return validLevels.some((level) => {
      return cluster.hits_by_total_risk[level] > 0;
    });
  });

  const risksResponse = await fetch(
    'api/insights-results-aggregator/v2/upgrade-risks-prediction',
    {
      method: 'POST',
      body: JSON.stringify({
        clusters: requiredClusters
          .slice(0, 100)
          .map((cluster) => cluster.cluster_id),
      }),
    },
  );

  const { predictions }: PredictionResponse = await risksResponse.json();
  const predictionsMap = predictions.reduce<Record<string, boolean>>(
    (acc, item) => {
      acc[item.cluster_id] = item.upgrade_recommended;
      return acc;
    },
    {},
  );
  return requiredClusters.slice(0, 100).map((cluster) => {
    return {
      ...cluster,
      upgrade_recommended: predictionsMap[cluster.cluster_id],
    };
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
    if (activeConversation) {
      updateContext({
        conversation_id: activeConversation.id,
        contextId,
        contextData: {
          clusters: data.map((cluster) => ({
            id: cluster.cluster_id,
            name: cluster.cluster_name,
          })),
        },
      });
    }
  }

  useEffect(() => {
    handleInit();
  }, [issueLevels]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const columns: DataViewTh[] = [
    { cell: 'Name', props: { key: `${componentId}-header-name` } },
    { cell: 'Cluster ID', props: { key: `${componentId}-header-cluster-id` } },
    { cell: 'Version', props: { key: `${componentId}-header-version` } },
    { cell: 'Critical', props: { key: `${componentId}-header-critical` } },
    { cell: 'Important', props: { key: `${componentId}-header-important` } },
  ];
  const rows: DataViewTr[] = clusters.map((cluster, index) => [
    createAnimatedCell(
      <>
        {`${cluster.cluster_name}`}&nbsp;
        {cluster.upgrade_recommended === false && (
          <Label color="yellow">Update risk</Label>
        )}
      </>,
      index,
      0,
      `${cluster.cluster_name}-name`,
    ),
    createAnimatedCell(
      <>
        <span style={{ marginRight: '8px' }}>{cluster.cluster_id}</span>
        <Tooltip content="Copy cluster ID to clipboard">
          <Button
            variant="plain"
            size="sm"
            onClick={() => copyToClipboard(cluster.cluster_id)}
            icon={<CopyIcon />}
            aria-label={`Copy cluster ID ${cluster.cluster_id}`}
          />
        </Tooltip>
      </>,
      index,
      1,
      `${cluster.cluster_name}-cluster-id`,
    ),
    createAnimatedCell(
      cluster.cluster_version,
      index,
      2,
      `${cluster.cluster_name}-version`,
    ),
    createAnimatedCell(
      cluster.hits_by_total_risk[4],
      index,
      3,
      `${cluster.cluster_name}-critical`,
    ),
    createAnimatedCell(
      cluster.hits_by_total_risk[3],
      index,
      4,
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
