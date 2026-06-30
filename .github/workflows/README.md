# CI/CD Workflows

## [ci.yml](./ci.yml)

Triggered on pull requests, this workflow runs tests on the target branch, focusing only on workspaces that have changes. Once all checks pass successfully, the pull request can be merged.

For every changed workspace it also builds a dynamic plugins container image with the [`rhdh-cli`](https://github.com/redhat-developer/rhdh-cli) (using the shared [`build-plugin-image`](../actions/build-plugin-image/action.yml) action). The image is labelled with `quay.expires-after=2w` so it is cleaned up automatically, and — for pull requests from the same repository — pushed to `quay.io/rhdh/rhdh-plugins` with the tags `<workspace>-pr-<pr-number>` and `<workspace>-pr-<pr-number>-<short-sha>`.

## [release_workspace.yml](./release_workspace.yml)

Handles the release process for a specific workspace from a specified branch (default: `main`). It either creates a "Version Packages" pull request if changesets are present or releases the packages within the workspace if they haven't been published yet. For more details on how changesets work, refer to the [Changesets documentation](https://github.com/changesets/changesets).

On every merge into `main` it builds and pushes a `quay.io/rhdh/rhdh-plugins:<workspace>-next` image for the changed workspace. When a workspace is actually released, it additionally builds and pushes a `quay.io/rhdh/rhdh-plugins:<workspace>-latest` image.

Pushing the container images requires the `QUAY_USERNAME` and `QUAY_PASSWORD` repository secrets.

## [release.yml](./release.yml)

Responsible for releasing all workspaces in parallel by invoking the `release_workspace.yml` workflow for each workspace. It runs on the main branch whenever new changes are pushed. The workflow relies on `release_workspace.yml` to determine if a workspace requires publishing.

## [version_bump.yml](./version_bump.yml)

Handles version bumping for specific workspaces. It creates a new branch for the version bump, updates the necessary files, commits the changes, and creates a pull request to merge the updates into the main branch.
