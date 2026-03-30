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

import Box from '@mui/material/Box';

import Scorecard from './Scorecard';
import type { ProcessedMetric } from './EntityScorecardContent';

interface ScorecardMetricsGridProps {
  metrics: ProcessedMetric[];
}

export const ScorecardMetricsGrid = ({ metrics }: ScorecardMetricsGridProps) => (
  <Box
    display="flex"
    flexWrap="wrap"
    gap={2}
    sx={{ alignItems: 'flex-start' }}
  >
    {metrics.map(metric => {
      const statusConfig = metric.statusConfig;
      return (
        <Scorecard
          key={metric.id}
          cardTitle={metric.title}
          description={metric.description}
          statusColor={statusConfig.color}
          StatusIcon={statusConfig.icon ?? (() => null)}
          value={metric.value}
          thresholds={metric.thresholds}
          isMetricDataError={metric.isMetricDataError}
          metricDataError={metric.metricDataError}
          isThresholdError={metric.isThresholdError}
          thresholdError={metric.thresholdError}
        />
      );
    })}
  </Box>
);
