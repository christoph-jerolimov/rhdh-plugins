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
import { Fragment, useState } from 'react';
import {
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarSubmenuItem,
} from '@backstage/core-components';
import { NavContentBlueprint, NavContentComponentProps } from '@backstage/plugin-app-react';
import { useAppSidebarContext } from './AppSidebarContext';

import { MoreItemsIcon } from '../components/MoreItemsIcon';

import type { AppSidebarGroup } from '../extensions/AppSidebarGroup';
import type { AppSidebarItem } from '../extensions/AppSidebarItem';

import { useResolveIcon } from '../hooks/useResolveIcon';

function SidebarNavGroupChild({ child }: { child: AppSidebarItem }) {
  const icon = useResolveIcon(child.icon);
  if (child.element) {
    return <Fragment>{child.element}</Fragment>;
  }
  return (
    <SidebarSubmenuItem
      title={child.title}
      to={child.href ?? ''}
      icon={icon}
    />
  );
}

function SidebarNavGroup({ group }: { group: AppSidebarGroup }) {
  const icon = useResolveIcon(group.icon);
  const [open, setOpen] = useState(false);
  const toggleMenu = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const sortedChildren = [...group.children].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
  );

  const hasChildren = group.children.length > 0;

  return (
    <>
      <SidebarItem
        icon={icon ?? (() => null)}
        text={group.title}
        onClick={toggleMenu}
      >
        {hasChildren ? <MoreItemsIcon open={open} /> : null}
      </SidebarItem>

      <div style={{
        width: '100%',
        marginLeft: '1rem',
        opacity: open ? 1 : 0,
        translate: open ? '0 0' : '0 1rem',
        transition: 'all 0.2s',
      }}>
        {open ? sortedChildren.map(child => (
          <SidebarItem
            icon={icon ?? (() => null)}
            text={child.title}
            to={child.href ?? ''}
          />
        )) : []}
      </div>

      <SidebarGroup
        title="asdasd"
        to="/settings"
        icon={<MoreItemsIcon open={open} />}
      >
        {/* <SidebarSettings icon={AccountCircleOutlinedIcon} /> */}
      </SidebarGroup>
    </>
  );
}

export function AppSidebar({ navItems }: NavContentComponentProps) {
  const { items, groups } = useAppSidebarContext();

  console.log('xxx navItems', navItems);
  console.log('xxx items', items);
  console.log('xxx groups', groups);

  const allEntries: Array<
    | { type: 'navitems'; data: AppSidebarItem }
    | { type: 'item'; data: AppSidebarItem }
    | { type: 'group'; data: AppSidebarGroup }
  > = [
    ...items.map(data => ({ type: 'item' as const, data })),
    ...groups.map(data => ({ type: 'group' as const, data })),
  ];

  allEntries.sort(
    (a, b) => (b.data.priority ?? 0) - (a.data.priority ?? 0),
  );

  return (
    <Sidebar>
      {allEntries.map(entry =>
        entry.type === 'group' ? (
          <SidebarNavGroup key={entry.data.id} group={entry.data} />
        ) : (
          <SidebarNavItem key={entry.data.id} item={entry.data} />
        ),
      )}
    </Sidebar>
  );
}

export const NavContent = NavContentBlueprint.make({
  params: {
    component: AppSidebar,
    //     <Sidebar>
    //       
    //       <SidebarGroup label="Menu" icon={<MenuIcon />}>
    //         {nav.take('page:catalog')}
    //         {nav.take('page:scaffolder')}
    //         <SidebarDivider />
    //         <SidebarScrollWrapper>
    //           {nav.rest({ sortBy: 'title' })}
    //           <ContributedSidebarItems navItems={navItems} />
    //         </SidebarScrollWrapper>
    //       </SidebarGroup>
    //       <SidebarSpace />
    //       <SidebarDivider />
    //       <NotificationsSidebarItem />
    //       <SidebarDivider />
    //       <SidebarGroup
    //         label="Settings"
    //         icon={<UserSettingsSignInAvatar />}
    //         to="/settings"
    //       >
    //         {nav.take('page:app-visualizer')}
    //         {nav.take('page:user-settings')}
    //       </SidebarGroup>
    //     </Sidebar>
      // );
    // },
  },
});
