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

import { HomePageCardMountPoint } from '../types';

/**
 * Util function that decides if a `home.page/card` mount point will be rendered
 * as 'default card' or just as 'available card'.
 *
 * This is needed when customization is enabled and if customers might adopt
 * the customization in yaml feature previously.
 *
 * 1. Card mount points with a `config.layout` should be shown by default.
 * 2. Card mount points without a name should be shown by default as well.
 *    This is for backward compatibilty.
 */
export function isCardADefaultConfiguration(
  cardMountPoint: HomePageCardMountPoint,
): boolean {
  return !!cardMountPoint.config?.layouts || !cardMountPoint.config?.name;
}

export function getCardDisplayName(
  cardMountPoint: HomePageCardMountPoint,
): string | undefined {
  return cardMountPoint.Component.displayName
    ?.replace('Extension(', '')
    .replace(')', '');
}

export function getCardName(cardMountPoint: HomePageCardMountPoint): string {
  if (cardMountPoint.config?.name) {
    return cardMountPoint.config?.name;
  }
  const stringifiedConfig = JSON.stringify({
    ...cardMountPoint.config,
    layouts: undefined,
    cardLayout: undefined,
    settings: undefined,
    priority: undefined,
  });
  return `${getCardDisplayName(cardMountPoint)}_${stringifiedConfig}`;
}
