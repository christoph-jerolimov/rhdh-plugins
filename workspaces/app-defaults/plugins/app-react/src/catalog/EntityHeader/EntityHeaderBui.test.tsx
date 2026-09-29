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

import { act, render, screen } from '@testing-library/react';

import { EntityHeaderBui } from './EntityHeaderBui';

// Known translations used by the mocked `t`.
const messages: Record<string, string> = {
  'catalog.entityHeader.lifecycleLabel': 'Lebenszyklus',
  'catalog.entityHeader.ownerLabel': 'Eigentümer',
  'catalog.entityHeader.systemLabel': 'System',
  'catalog.entityHeader.domainLabel': 'Domäne',
  'catalog.entityHeader.partOfLabel': 'Teil von',
  'catalog.entityHeader.addToFavorites': 'Zu Favoriten hinzufügen',
  'catalog.entityHeader.removeFromFavorites': 'Aus Favoriten entfernen',
  'catalog.entityHeader.moreActions': 'Weitere Aktionen',
  'catalog.entityKinds.Component': 'Komponente',
};

// Mirrors the i18next behaviour: return the translation for a known key,
// otherwise the provided default value (or the key itself).
const t = (key: string, options?: { defaultValue?: string }) =>
  messages[key] ?? options?.defaultValue ?? key;

jest.mock('@backstage/core-plugin-api/alpha', () => ({
  ...jest.requireActual('@backstage/core-plugin-api/alpha'),
  useTranslationRef: () => ({ t }),
}));

jest.mock('@backstage/frontend-plugin-api', () => ({
  ...jest.requireActual('@backstage/frontend-plugin-api'),
  useTranslationRef: () => ({ t }),
}));

const mockCatalogApi = {
  getEntitiesByRefs: jest.fn().mockResolvedValue({ items: [] }),
};
jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: () => mockCatalogApi,
  useRouteRefParams: () => ({
    kind: 'component',
    namespace: 'default',
    name: 'my-service',
  }),
}));

const mockUseAsyncEntity = jest.fn();
jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useAsyncEntity: () => mockUseAsyncEntity(),
  useEntityPresentation: () => ({ primaryTitle: 'my-service' }),
  useEntityRefLink: () => () => '/catalog/link',
  useStarredEntity: () => ({
    isStarredEntity: false,
    toggleStarredEntity: jest.fn(),
  }),
}));

// Render the props passed to the `Header` so the translated labels are
// observable without the full Backstage UI header.
jest.mock('@backstage/ui', () => ({
  ...jest.requireActual('@backstage/ui'),
  Header: (props: any) => (
    <div>
      {props.tags.map((tag: any) => (
        <span key={tag.label} data-testid="tag">
          {tag.label}
        </span>
      ))}
      {props.metadata.map((item: any) => (
        <span key={item.label} data-testid="metadata-label">
          {item.label}
        </span>
      ))}
      {props.customActions}
    </div>
  ),
  HeaderMetadataUsers: () => null,
  ButtonIcon: (props: any) => <button aria-label={props['aria-label']} />,
  Menu: () => null,
  MenuTrigger: (props: any) => <div>{props.children}</div>,
}));

const entity = (kind: string) => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind,
  metadata: { name: 'my-service' },
  spec: { type: 'service', lifecycle: 'production', owner: 'team-a' },
  relations: [
    { type: 'ownedBy', targetRef: 'group:default/team-a' },
    { type: 'partOf', targetRef: 'system:default/my-system' },
    { type: 'partOf', targetRef: 'domain:default/my-domain' },
    { type: 'partOf', targetRef: 'component:default/parent' },
  ],
});

// Renders the header and waits for the owner lookup to settle.
const renderHeader = async (kind: string) => {
  mockUseAsyncEntity.mockReturnValue({ entity: entity(kind) });
  await act(async () => {
    render(<EntityHeaderBui tabs={[]} />);
  });
};

describe('EntityHeaderBui', () => {
  it('translates the metadata labels', async () => {
    await renderHeader('Component');

    const labels = screen
      .getAllByTestId('metadata-label')
      .map(node => node.textContent);
    expect(labels).toEqual([
      'Lebenszyklus',
      'Eigentümer',
      'System',
      'Domäne',
      'Teil von',
    ]);
  });

  it('translates known entity kinds and keeps the entity type as is', async () => {
    await renderHeader('Component');

    const tags = screen.getAllByTestId('tag').map(node => node.textContent);
    expect(tags).toEqual(['Komponente', 'service']);
  });

  it('falls back to the original kind when no translation exists', async () => {
    await renderHeader('CustomKind');

    expect(screen.getAllByTestId('tag')[0]).toHaveTextContent('CustomKind');
  });

  it('translates the favorite and context menu button labels', async () => {
    await renderHeader('Component');

    expect(
      screen.getByRole('button', { name: 'Zu Favoriten hinzufügen' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Weitere Aktionen' }),
    ).toBeInTheDocument();
  });
});
