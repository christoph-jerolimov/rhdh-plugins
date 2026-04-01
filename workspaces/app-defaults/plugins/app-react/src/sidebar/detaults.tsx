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
  SidebarDivider,
  SidebarGroup,
  SidebarSpace,
} from '@backstage/core-components';

import MenuIcon from '@material-ui/icons/Menu';

import { SidebarSearchModal } from '@backstage/plugin-search';

import SearchIcon from '@material-ui/icons/Search';

import {
  AppSidebarGroupBlueprint,
  AppSidebarItemBlueprint,
} from './extensions';

import { SidebarLogo } from './components/SidebarLogo';

/**
 * <SidebarLogo />
 */
const logo = AppSidebarItemBlueprint.make({
  name: 'logo',
  params: {
    id: 'logo',
    title: 'Logo',
    element: <SidebarLogo />,
    priority: 1000,
  },
});

/**
 * Search component
 */
const search = AppSidebarItemBlueprint.make({
  name: 'search',
  params: {
    id: 'search',
    title: 'Search',
    element: (
      <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
        <SidebarSearchModal />
      </SidebarGroup>
    ),
    priority: 900,
  },
});

const searchDividerAfter = AppSidebarItemBlueprint.make({
  name: 'search-divider-after',
  params: {
    id: 'search-divider-after',
    title: 'Search',
    element: <SidebarDivider />,
    priority: 899,
  },
});

const menuGroup = AppSidebarGroupBlueprint.make({
  name: 'menuGroup',
  params: {
    id: 'menu',
    title: 'Menu',
    icon: MenuIcon,
  },
});

const spacer = AppSidebarItemBlueprint.make({
  name: 'spacer',
  params: {
    id: 'spacer',
    title: 'Spacer',
    element: <SidebarSpace />,
    priority: -1,
  },
});

const adminDividerBefore = AppSidebarItemBlueprint.make({
  name: 'admin-divider-before',
  params: {
    id: 'admin-divider-before',
    title: 'Admin Divider Before',
    element: <SidebarDivider />,
    priority: -999,
  },
});

const adminGroup = AppSidebarGroupBlueprint.make({
  name: 'admin-platform',
  params: {
    id: 'admin-platform',
    title: 'Admin',
    // icon: CategoryIcon,
    priority: -1000,
  },
});

export const allDefaultSidebarItems = [
  logo,
  search,
  searchDividerAfter,
  menuGroup,
  spacer,
  adminDividerBefore,
  adminGroup,
];
