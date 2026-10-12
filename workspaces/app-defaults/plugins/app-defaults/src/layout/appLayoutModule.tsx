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

import {
  coreExtensionData,
  createExtension,
  createExtensionDataRef,
  createExtensionInput,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import {
  appDrawerContentDataRef,
  appHeaderDataRef,
} from '@red-hat-developer-hub/backstage-plugin-app-react';

import { AppLayout } from './AppLayout';

/**
 * Extension data ref carrying the Backstage app navigation and the routed
 * page content from the `app/layout` slot to the RHDH layout.
 *
 * @public
 */
export const appLayoutPageDataRef = createExtensionDataRef<{
  nav: JSX.Element;
  content: JSX.Element;
}>().with({ id: 'rhdh.app.layout.page' });

/**
 * Override of the Backstage `app/layout` extension. Backstage attaches the
 * app navigation (`app/nav`) and the routed page content (`app/routes`) to
 * this extension ID, so it keeps its name; instead of rendering the stock
 * sidebar page it forwards both to {@link appLayoutExtension}, which renders
 * the RHDH layout. Installed together with it by {@link appLayoutModule} and
 * `appDefaultsModule`.
 *
 * @public
 */
export const appLayoutPageExtension = createExtension({
  name: 'layout',
  attachTo: { id: 'app/rhdh-layout', input: 'page' },
  inputs: {
    nav: createExtensionInput([coreExtensionData.reactElement], {
      singleton: true,
    }),
    content: createExtensionInput([coreExtensionData.reactElement], {
      singleton: true,
    }),
  },
  output: [appLayoutPageDataRef],
  factory({ inputs }) {
    return [
      appLayoutPageDataRef({
        nav: inputs.nav.get(coreExtensionData.reactElement),
        content: inputs.content.get(coreExtensionData.reactElement),
      }),
    ];
  },
});

/**
 * App layout extension that replaces the Backstage default layout with the
 * RHDH {@link AppLayout}: all headers contributed via `AppHeaderBlueprint`
 * on top, and the sidebar, the page content and the app drawer side by side
 * below them.
 *
 * Extension ID: `app/rhdh-layout`. `AppHeaderBlueprint` attaches to the
 * `headers` input and `AppDrawerContentBlueprint` to the `drawers` input,
 * both from `@red-hat-developer-hub/backstage-plugin-app-react`, so plugins
 * only need to declare their headers and drawers. The sidebar and the page
 * content arrive through the `page` input from {@link appLayoutPageExtension}.
 *
 * @public
 */
export const appLayoutExtension = createExtension({
  name: 'rhdh-layout',
  attachTo: { id: 'app/root', input: 'children' },
  inputs: {
    page: createExtensionInput([appLayoutPageDataRef], { singleton: true }),
    headers: createExtensionInput([appHeaderDataRef]),
    drawers: createExtensionInput([appDrawerContentDataRef]),
  },
  output: [coreExtensionData.reactElement],
  factory({ inputs }) {
    const { nav, content } = inputs.page.get(appLayoutPageDataRef);
    const headers = inputs.headers.map(h => h.get(appHeaderDataRef));
    const drawers = inputs.drawers.map(d => d.get(appDrawerContentDataRef));
    return [
      coreExtensionData.reactElement(
        <AppLayout
          headers={headers}
          drawers={drawers}
          nav={nav}
          content={content}
        />,
      ),
    ];
  },
});

/**
 * Frontend module that provides the RHDH app layout with the app headers and
 * the app drawer. Registers the `app/rhdh-layout` extension that accepts
 * header and drawer contributions via inputs, and the `app/layout` override
 * that hands the Backstage navigation and page content to it.
 *
 * @public
 */
export const appLayoutModule = createFrontendModule({
  pluginId: 'app',
  extensions: [appLayoutPageExtension, appLayoutExtension],
});
