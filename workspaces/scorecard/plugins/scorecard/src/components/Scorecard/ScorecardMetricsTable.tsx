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

import { useMemo, useState } from 'react';
import {
  CellText,
  ColumnConfig,
  SortDescriptor,
  Table,
  TableItem,
} from '@backstage/ui';
import { useTheme } from '@mui/material/styles';

import { useTranslation } from '../../hooks/useTranslation';
import { resolveStatusColor } from '../../utils';
import type { ProcessedMetric } from './EntityScorecardContent';

interface ScorecardRow extends TableItem {
  metric: ProcessedMetric;
}

interface ScorecardMetricsTableProps {
  metrics: ProcessedMetric[];
}

export const ScorecardMetricsTable = ({
  metrics,
}: ScorecardMetricsTableProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [sort, onSortChange] = useState<SortDescriptor>({
    column: 'metric',
    direction: 'ascending',
  });

  const columns = useMemo<ColumnConfig<ScorecardRow>[]>(
    () => [
      {
        id: 'metric',
        label: t('table.metricColumn'),
        cell: item => (
          <CellText
            title={item.metric.title}
            description={item.metric.description}
          />
        ),
        isRowHeader: true,
        isSortable: true,
      },
      {
        id: 'status',
        label: t('table.statusColumn'),
        isSortable: true,
        cell: item => {
          if (item.metric.isThresholdError) {
            return (
              <CellText
                title={
                  item.metric.thresholdError ?? t('errors.invalidThresholds')
                }
                color="secondary"
              />
            );
          }
          const evaluation = t(`thresholds.${item.metric.thresholds?.evaluation}` as any, {}) ?? t('table.noThreshold');
          return (
            <CellText
              leadingIcon={
                item.metric.statusConfig.icon ? (
                  <item.metric.statusConfig.icon
                    style={{
                      fontSize: 20,
                      color: resolveStatusColor(theme, item.metric.statusConfig.color),
                    }}
                  />
                ) : undefined
              }
              title={evaluation}
            />
          );
        },
      },
      {
        id: 'value',
        label: t('table.valueColumn'),
        cell: item => {
          if (item.metric.isMetricDataError) {
            return (
              <CellText
                title={
                  item.metric.metricDataError ??
                  t('errors.metricDataUnavailable')
                }
                color="secondary"
              />
            );
          }
          return (
            <CellText
              title={
                item.metric.value !== null && item.metric.value !== undefined
                  ? String(item.metric.value)
                  : '-'
              }
            />
          );
        },
        isSortable: true,
      },
    ],
    [t],
  );

  const rows = useMemo<ScorecardRow[]>(() => {
    const mapped = metrics.map(metric => ({
      id: metric.id,
      metric,
    }));

    const direction = sort.direction === 'descending' ? -1 : 1;

    return mapped.sort((a, b) => {
      let cmp = 0;
      switch (sort.column) {
        case 'metric':
          cmp = a.metric.title.localeCompare(b.metric.title);
          break;
        case 'value': {
          const aVal = a.metric.value ?? -Infinity;
          const bVal = b.metric.value ?? -Infinity;
          cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          break;
        }
        case 'status': {
          const statusOrder: Record<string, number> = {
            success: 0,
            warning: 1,
            error: 2,
          };
          const aOrder =
            statusOrder[a.metric.thresholds?.evaluation ?? ''] ?? 3;
          const bOrder =
            statusOrder[b.metric.thresholds?.evaluation ?? ''] ?? 3;
          cmp = aOrder - bOrder;
          break;
        }
        default:
          break;
      }
      return cmp * direction;
    });
  }, [metrics, sort]);

  return (
    <Table
      columnConfig={columns}
      data={rows}
      pagination={{ type: 'none' }}
      sort={{
        descriptor: sort,
        onSortChange,
      }}
      emptyState={t('table.noMetrics')}
    />
  );
};
