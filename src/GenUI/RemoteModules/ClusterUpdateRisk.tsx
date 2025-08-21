import {
  Alert,
  Content,
  Icon,
  Label,
  Level,
  LevelItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import React from 'react';
import { CheckCircleIcon, WarningTriangleIcon } from '@patternfly/react-icons';
import { AnimatedTableContainer, createAnimatedCell } from '../AnimationUtils';
import { DataViewTable, DataViewTrTree } from '@patternfly/react-data-view';

type ClusterInfoResponse = {
  cluster: {
    cluster_id: string;
    display_name: string;
    managed: boolean;
    status: string;
  };
};

type UpgradeAlert = {
  name: string;
  namespace: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  url: string;
};

type OperatorCondition = {
  name: string;
  condition: string;
  reason?: string;
  url: string;
};

type ClusterRiskResponse = {
  status: string;
  meta: {
    last_checked_at: string;
  };
  upgrade_recommendation: {
    upgrade_recommended: boolean;
    upgrade_risks_predictors: {
      alerts: UpgradeAlert[];
      operator_conditions: OperatorCondition[];
    };
  };
};

type UpgradeState = {
  clusterName: string;
  clusterId: string;
  upgrade_recommended: boolean;
  alerts: UpgradeAlert[];
  operator_conditions: OperatorCondition[];
  last_checked_at: string;
};

async function getUpdateRiskData(clusterId: string): Promise<UpgradeState> {
  const clusterInfoResponse = await fetch(
    `/api/insights-results-aggregator/v2/cluster/${clusterId}/info`,
  );
  const clusterInfo: ClusterInfoResponse = await clusterInfoResponse.json();

  const fetchRiskResponse = await fetch(
    `/api/insights-results-aggregator/v2/cluster/${clusterId}/upgrade-risks-prediction`,
  );

  const clusterRisk: ClusterRiskResponse = await fetchRiskResponse.json();
  const result: UpgradeState = {
    clusterName: clusterInfo.cluster.display_name,
    clusterId: clusterInfo.cluster.cluster_id,
    last_checked_at: clusterRisk.meta.last_checked_at,
    upgrade_recommended: clusterRisk.upgrade_recommendation.upgrade_recommended,
    alerts: clusterRisk.upgrade_recommendation.upgrade_risks_predictors.alerts,
    operator_conditions:
      clusterRisk.upgrade_recommendation.upgrade_risks_predictors
        .operator_conditions,
  };
  return result;
}

// const mockProps = {
//   scope: 'frontendStarterApp',
//   module: './ClusterUpdateRisk',
//   importName: 'default',
//   props: {
//     clusterId: 'b4d69815-7cce-41c7-bc36-e674098315fe',
//   },
//   contextId: 'e068732b-fb79-4d7e-8c1e-92bd94375f31',
//   componentId: 'c3c94c65-9850-459c-ad52-1a8e38b47139',
// };

const ClusterUpdateRisk = ({
  clusterId,
  componentId,
}: {
  clusterId: string;
  componentId: string;
}) => {
  const [upgradeState, setUpgradeState] = React.useState<
    UpgradeState | undefined
  >(undefined);

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await getUpdateRiskData(clusterId);
      setUpgradeState(data);
    };
    fetchData();
  }, [clusterId]);

  if (!upgradeState) return null;

  const columns = ['Name'];
  const alertsIcon =
    upgradeState.alerts.length > 0 ? (
      <Icon status="warning" size="md">
        <WarningTriangleIcon />
      </Icon>
    ) : (
      <Icon status="success" size="md">
        <CheckCircleIcon />
      </Icon>
    );
  const operatorIcon =
    upgradeState.operator_conditions.length > 0 ? (
      <Icon status="warning" size="md">
        <WarningTriangleIcon />
      </Icon>
    ) : (
      <Icon status="success" size="md">
        <CheckCircleIcon />
      </Icon>
    );
  const rows: DataViewTrTree[] = [
    {
      row: [
        createAnimatedCell(
          <>
            <Level>
              <LevelItem className="pf-v6-u-mr-md">
                {alertsIcon}&nbsp;
              </LevelItem>
              <LevelItem className="pf-v6-u-mr-md">
                <Title headingLevel="h4" size="md">
                  Alerts firing
                </Title>
              </LevelItem>
              <LevelItem>
                <Label
                  variant="outline"
                  color={upgradeState.alerts.length > 0 ? 'grey' : 'green'}
                >
                  {upgradeState.alerts.length} update risks
                </Label>
              </LevelItem>
            </Level>
          </>,
          0,
          0,
          'alerts-parent',
        ),
      ],
      id: 'alerts-row',
      children:
        upgradeState.alerts.length > 0
          ? [
              {
                id: 'alerts-child',
                row: [
                  {
                    cell: (
                      <DataViewTable
                        columns={['Name', 'Severity']}
                        rows={upgradeState.alerts.map((alert) => [
                          {
                            cell: (
                              <a
                                href={alert.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {alert.name}
                              </a>
                            ),
                          },
                          alert.severity,
                        ])}
                      />
                    ),
                  },
                ],
              },
            ]
          : undefined,
    },
    {
      row: [
        createAnimatedCell(
          <>
            <Level>
              <LevelItem className="pf-v6-u-mr-md">
                {operatorIcon}&nbsp;
              </LevelItem>
              <LevelItem className="pf-v6-u-mr-md">
                <Title headingLevel="h4" size="md">
                  Cluster operators
                </Title>
              </LevelItem>
              <LevelItem>
                <Label
                  variant="outline"
                  color={
                    upgradeState.operator_conditions.length > 0
                      ? 'grey'
                      : 'green'
                  }
                >
                  {upgradeState.operator_conditions.length} update risks
                </Label>
              </LevelItem>
            </Level>
          </>,
          0,
          0,
          'operators-parent',
        ),
      ],
      id: 'operators-row',
      children:
        upgradeState.operator_conditions.length > 0
          ? [
              {
                id: 'operators-child',
                row: [
                  {
                    cell: (
                      <DataViewTable
                        columns={['Name', 'Status', 'Message']}
                        rows={upgradeState.operator_conditions.map(
                          (condition) => [
                            {
                              cell: (
                                <a
                                  href={condition.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {condition.name}
                                </a>
                              ),
                            },
                            condition.condition,
                            condition.reason || '-',
                          ],
                        )}
                      />
                    ),
                  },
                ],
              },
            ]
          : undefined,
    },
  ];
  return (
    <>
      <Stack hasGutter>
        <StackItem className="pf-v6-u-p-md">
          <Title headingLevel="h2">{upgradeState.clusterName}</Title>
          <Stack hasGutter>
            <StackItem>
              <Content>UUID: {upgradeState.clusterId}</Content>
              <Content>
                Last Checked At:{' '}
                {new Date(upgradeState.last_checked_at).toUTCString()}
              </Content>
            </StackItem>
            {!upgradeState.upgrade_recommended && (
              <StackItem>
                <Alert title="Resolve update risks" isInline variant="warning">
                  There are risks present that could impact the success of your
                  cluster update. For the best performance, resolve these risks
                  in the <b>Update risks</b> tab before updating.
                </Alert>
              </StackItem>
            )}
          </Stack>
        </StackItem>
        <StackItem>
          <AnimatedTableContainer componentId={componentId}>
            <DataViewTable
              variant="compact"
              isTreeTable
              columns={columns}
              rows={rows}
            />
          </AnimatedTableContainer>
        </StackItem>
      </Stack>
    </>
  );
};

export default ClusterUpdateRisk;
