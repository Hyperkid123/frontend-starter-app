import React, { useEffect, useMemo, useState } from 'react';
import { ClusterData } from './common';
import { AnimatedTableContainer, createAnimatedCell } from '../AnimationUtils';
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
  AngleDoubleUpIcon,
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
    <Label isCompact color="orange" icon={<AngleDoubleUpIcon />}>
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

const ClusterRecommendations = ({
  clusterId,
  componentId,
}: {
  clusterId: string;
  componentId: string;
}) => {
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
    {
      cell: 'Description',
      props: { key: `${componentId}-header-description` },
    },
    { cell: 'Modified', props: { key: `${componentId}-header-modified` } },
    {
      cell: 'First impacted',
      props: { key: `${componentId}-header-impacted` },
    },
    { cell: 'Total risk', props: { key: `${componentId}-header-risk` } },
  ];

  const rows = useMemo<DataViewTrTree[]>(() => {
    if (!data?.report?.data) {
      return [];
    }

    return data.report.data.map((item, index) => ({
      row: [
        createAnimatedCell(
          item.description,
          index,
          0,
          `${item.rule_id}-description`,
        ),
        createAnimatedCell(
          item.created_at,
          index,
          1,
          `${item.rule_id}-created`,
        ),
        createAnimatedCell(item.impacted, index, 2, `${item.rule_id}-impacted`),
        createAnimatedCell(
          riskLabelMapper[item.total_risk],
          index,
          3,
          `${item.rule_id}-risk`,
        ),
      ],
      id: item.rule_id,
      children: [
        {
          id: item.rule_id + 'child',
          row: [
            {
              ...createAnimatedCell(
                <Recommendation clusterRule={item} />,
                index,
                4,
                `${item.rule_id}-recommendation`,
              ),
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
          <AnimatedTableContainer componentId={componentId}>
            <DataViewTable isTreeTable columns={columns} rows={rows} />
          </AnimatedTableContainer>
        </StackItem>
      </Stack>
    </>
  );
};

export default ClusterRecommendations;

// Can you show me clusters with high severity vulnerabilities?
// The cluster named iqe-ocp-vulnerability-stage-test-jun27 have a lot. Can you show me detail for recommendations?
