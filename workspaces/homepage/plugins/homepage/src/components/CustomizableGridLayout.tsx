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

// This complete read-only home page grid picks up the idea and styles from
// https://github.com/backstage/backstage/blob/master/plugins/home
// Esp. from the CustomHomepageGrid component:
// https://github.com/backstage/backstage/blob/master/plugins/home/src/components/CustomHomepage/CustomHomepageGrid.tsx
// but without the drag and drop functionality.

import { Fragment, useMemo, useRef } from 'react';

import {
  CustomHomepageGrid,
  LayoutConfiguration,
} from '@backstage/plugin-home';
import { useTheme } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';

import { cardWrapperSx } from '../styles/cardWrapperSx';
import { HomePageCardConfig } from '../types';
import { useContainerQuery } from '../hooks/useContainerQuery';

import 'react-grid-layout/css/styles.css';

/**
 * Props for the customizable grid layout.
 */
export interface CustomizableGridLayoutProps {
  /**
   * All widgets a user can place on the homepage. These are offered in the
   * "Add widget" dialog of the grid.
   */
  homepageCards: HomePageCardConfig[];
  /**
   * Widgets that make up the default layout (shown until the user customizes
   * the page, and restored via "Restore defaults"). One entry per card to
   * place; the same widget may appear more than once.
   *
   * Defaults to `homepageCards`.
   */
  defaultCards?: HomePageCardConfig[];
}

/**
 * Customizable grid layout for the NFS home page (drag, drop, resize).
 *
 */
export const CustomizableGridLayout = ({
  homepageCards,
  defaultCards = homepageCards,
}: CustomizableGridLayoutProps) => {
  const theme = useTheme();
  const gridContainerRef = useRef<HTMLDivElement>(null);
  useContainerQuery(gridContainerRef, { notifyWindowResize: true });

  const config = useMemo(() => {
    const defaultConfig: LayoutConfiguration[] = [];

    defaultCards.forEach(homepageCard => {
      if (!homepageCard.node) {
        return;
      }

      const layout = homepageCard.breakpointLayouts?.xl || {};

      defaultConfig.push({
        component: homepageCard.component,
        x: layout.x ?? 0,
        y: layout.y ?? 0,
        width: layout.w ?? 12,
        height: layout.h ?? 4,
        movable: true,
        deletable: true,
        resizable: true,
      });
    });

    return defaultConfig;
  }, [defaultCards]);

  return (
    <>
      <GlobalStyles
        styles={{
          '[class*="makeStyles-settingsOverlay"]': {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(20, 20, 20, 0.95) !important'
                : 'rgba(40, 40, 40, 0.93) !important',
          },
          '[class*="widgetWrapper"]': cardWrapperSx,
        }}
      />
      <div
        ref={gridContainerRef}
        style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
      >
        <CustomHomepageGrid
          config={config}
          preventCollision={false}
          compactType="vertical"
          style={{ margin: '-10px' }}
        >
          {homepageCards.map((card, index) => (
            <Fragment key={card.name ?? index}>{card.component}</Fragment>
          ))}
        </CustomHomepageGrid>
      </div>
    </>
  );
};
