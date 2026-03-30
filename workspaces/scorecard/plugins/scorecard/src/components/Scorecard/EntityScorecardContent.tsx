/*
 * Copyright Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react';

import {
  MetricResult,
  MetricValue,
  ThresholdResult,
} from '@red-hat-developer-hub/backstage-plugin-scorecard-common';
import { ResponseErrorPanel } from '@backstage/core-components';
import { Flex, ToggleButton, ToggleButtonGroup } from '@backstage/ui';
import {
  RiGridFill as GridIcon,
  RiListUnordered as ListIcon,
} from '@remixicon/react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import NoScorecardsState from '../Common/NoScorecardsState';
import { ScorecardMetricsGrid } from './ScorecardMetricsGrid';
import { ScorecardMetricsTable } from './ScorecardMetricsTable';
import { useScorecards } from '../../hooks/useScorecards';
import { getStatusConfig, StatusConfig } from '../../utils';
import PermissionRequiredState from '../Common/PermissionRequiredState';
import { useTranslation } from '../../hooks/useTranslation';

export type ProcessedMetric = {
  id: string;
  title: string;
  description: string;
  value: MetricValue | null;
  statusConfig: StatusConfig;
  thresholds?: ThresholdResult;
  isMetricDataError: boolean;
  metricDataError?: string;
  isThresholdError: boolean;
  thresholdError?: string;
};

export const EntityScorecardContent = () => {
  const { scorecards, loadingData, error } = useScorecards();
  const { t } = useTranslation();
  const [view, setView] = useState<'grid' | 'table'>('grid');

  if (loadingData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    if (error.message?.includes('NotAllowedError')) {
      return <PermissionRequiredState />;
    }
    return <ResponseErrorPanel error={error} />;
  }

  if (!loadingData && scorecards?.length === 0) {
    return <NoScorecardsState />;
  }

  const processedMetrics: ProcessedMetric[] =
    scorecards?.map((metric: MetricResult) => {
      const isMetricDataError =
        metric.status === 'error' || metric.result?.value === null;

      const isThresholdError =
        metric.result?.thresholdResult?.status === 'error';

      const statusConfig = getStatusConfig({
        evaluation: metric.result?.thresholdResult?.evaluation,
        thresholdStatus: metric.result?.thresholdResult?.status,
        metricStatus: metric.status,
        thresholdRules: metric.result.thresholdResult.definition?.rules,
      });

      const titleKey = `metric.${metric.id}.title`;
      const descriptionKey = `metric.${metric.id}.description`;

      const title = t(titleKey as any, {});
      const description = t(descriptionKey as any, {});

      const finalTitle = title === titleKey ? metric.metadata.title : title;
      const finalDescription =
        description === descriptionKey
          ? metric.metadata.description
          : description;

      return {
        id: metric.id,
        title: finalTitle,
        description: finalDescription,
        value: metric.result?.value ?? null,
        statusConfig,
        thresholds: metric.result?.thresholdResult,
        isMetricDataError,
        metricDataError: metric?.error,
        isThresholdError,
        thresholdError: metric.result?.thresholdResult?.error,
      };
    }) ?? [];

  return (
    <Flex direction="column" gap="4">
      <Flex justify="end">
        <ToggleButtonGroup
          selectedKeys={[view]}
          onSelectionChange={keys =>
            setView(keys.has('table') ? 'table' : 'grid')
          }
        >
          <ToggleButton id="grid" iconStart={<GridIcon />}>
            Grid
          </ToggleButton>
          <ToggleButton id="table" iconStart={<ListIcon />}>
            Table
          </ToggleButton>
        </ToggleButtonGroup>
      </Flex>
      {view === 'grid' ? (
        <ScorecardMetricsGrid metrics={processedMetrics} />
      ) : (
        <ScorecardMetricsTable metrics={processedMetrics} />
      )}
    </Flex>
  );
};
