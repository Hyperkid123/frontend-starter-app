import React, { useEffect, useMemo, useState } from 'react';
import { ClusterData } from './common';
import {
  Content,
  Divider,
  Label,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import {
  DataViewTable,
  DataViewTh,
  DataViewTrTree,
} from '@patternfly/react-data-view';
import {
  AngleDoubleDownIcon,
  BullseyeIcon,
  EqualsIcon,
  ExclamationIcon,
  ThumbsUpIcon,
} from '@patternfly/react-icons';

const riskLabelMapper = {
  0: undefined,
  1: (
    <Label isCompact color="blue" icon={<AngleDoubleDownIcon />}>
      Low
    </Label>
  ),
  2: (
    <Label isCompact color="yellow" icon={<EqualsIcon />}>
      Moderate
    </Label>
  ),
  3: (
    <Label isCompact color="orange" icon={<AngleDoubleDownIcon />}>
      Important
    </Label>
  ),
  4: (
    <Label isCompact color="red" icon={<ExclamationIcon />}>
      Critical
    </Label>
  ),
};

type ClusterRule = {
  description: string;
  created_at: string;
  details: string;
  reason: string;
  resolution: string;
  total_risk: 0 | 1 | 2 | 3 | 4;
  rule_id: string;
  impacted: string;
};

type ClusterRecommendationResponse = {
  report: {
    meta: ClusterData;
    data: ClusterRule[];
  };
  status: string;
};

async function getClusterRecommendations(clusterId: string) {
  const response = await fetch(
    `/api/insights-results-aggregator/v2/cluster/${clusterId}/reports?get_disabled=false`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch cluster recommendations');
  }
  const result: ClusterRecommendationResponse = await response.json();
  return result;
}

const Recommendation = ({ clusterRule }: { clusterRule: ClusterRule }) => {
  return (
    <Stack>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          <BullseyeIcon />
          &nbsp; Detected issues
        </Title>
        <Content>{clusterRule.details}</Content>
        <Divider />
        <Title headingLevel="h2" size="lg">
          <ThumbsUpIcon />
          &nbsp; Steps to resolve
        </Title>
        <Content component="pre">{clusterRule.resolution}</Content>
      </StackItem>
    </Stack>
  );
};

const ClusterRecommendations = ({ clusterId }: { clusterId: string }) => {
  const [data, setData] = useState<ClusterRecommendationResponse | undefined>(
    undefined,
  );
  useEffect(() => {
    const fetchData = async () => {
      const result = await getClusterRecommendations(clusterId);
      setData(result);
    };
    fetchData();
  }, [clusterId]);

  const columns: DataViewTh[] = [
    'Description',
    'Modified',
    'First impacted',
    'Total risk',
  ];

  const rows = useMemo<DataViewTrTree[]>(() => {
    if (!data?.report?.data) {
      return [];
    }

    return data.report.data.map((item) => ({
      row: [
        item.description,
        item.created_at,
        item.impacted,
        { cell: <>{riskLabelMapper[item.total_risk]}</> },
      ],
      id: item.rule_id,
      children: [
        {
          id: item.rule_id + 'child',
          row: [
            {
              cell: <Recommendation clusterRule={item} />,
              colSpan: 4,
            },
          ],
        },
      ],
    }));
  }, [data?.report?.data]);
  console.log({ rows });
  return (
    <>
      <Stack>
        <StackItem>
          <DataViewTable isTreeTable columns={columns} rows={rows} />
        </StackItem>
      </Stack>
    </>
  );
};

export default ClusterRecommendations;

// Can you show me clusters with high severity vulnerabilities?
// The cluster named iqe-ocp-vulnerability-stage-test-jun27 have a lot. Can you show me detail for recommendations?
