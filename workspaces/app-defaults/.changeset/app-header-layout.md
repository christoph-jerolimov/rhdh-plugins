---
'@red-hat-developer-hub/backstage-plugin-app-react': minor
'@red-hat-developer-hub/backstage-plugin-app-defaults': minor
---

Add `AppHeaderBlueprint` (with `appHeaderDataRef` and the `AppHeaderData` type) to app-react so plugins can contribute header bars with a component and a priority. app-defaults now provides `app/rhdh-layout` (`appLayoutExtension`, `appLayoutModule`, `./app-layout-module` entry) and overrides the Backstage `app/layout` extension (`appLayoutPageExtension`) to forward the navigation and the page content to it, a layout that stacks all contributed headers above everything (`AppHeaders`) and renders the sidebar, the page content and the application drawer side by side below them (`AppLayout`). `AppDrawerContentBlueprint` now attaches to the `drawers` input of `app/rhdh-layout` instead of the removed `app-root-wrapper:app/drawer` extension; `appDrawerExtension` and `appDrawerModule` are kept as deprecated aliases of the layout extension and module.
