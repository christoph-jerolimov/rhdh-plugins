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

import { coreExtensionData } from '@backstage/frontend-plugin-api';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import { CustomScaffolderPage } from './CustomScaffolderPage';

/**
 * Override of the Backstage scaffolder plugin that adds an empty state
 * when no templates are available and opts the template wizard form into
 * the Backstage UI (BUI) theme instead of the legacy MUI theme.
 *
 * @public
 */
export const scaffolderPluginOverride: typeof scaffolderPlugin =
  scaffolderPlugin.withOverrides({
    extensions: [
      scaffolderPlugin.getExtension('sub-page:scaffolder/templates').override({
        factory(originalFactory, { config }) {
          const original = originalFactory({
            // Render the scaffolder form with Backstage UI components.
            // The upstream default is still the MUI form.
            config: { ...config, enableBackstageUi: true },
          });
          const originalElement = original.get(coreExtensionData.reactElement);
          return [
            ...original,
            coreExtensionData.reactElement(
              <CustomScaffolderPage>{originalElement}</CustomScaffolderPage>,
            ),
          ];
        },
      }),
      // add the other extensions to keep the origin order (/templates sub-page first)
      scaffolderPlugin.getExtension('sub-page:scaffolder/actions'),
      scaffolderPlugin.getExtension('sub-page:scaffolder/editor'),
      scaffolderPlugin.getExtension('sub-page:scaffolder/tasks'),
      scaffolderPlugin.getExtension(
        'sub-page:scaffolder/templating-extensions',
      ),
    ],
  });
