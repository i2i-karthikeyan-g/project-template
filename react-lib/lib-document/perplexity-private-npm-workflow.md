# Private npm Publishing Workflow and Hosting Comparison

## Step-by-step Dev Workflow for Publishing a Private npm Package

This section focuses only on the workflow and mechanics of publishing the UI library as a **private npm package**, independent of whether the backing registry is GitHub Packages or Azure Artifacts.[^1][^2][^3]

### 1. Local project setup

1. Create the UI library project and ensure these are in place:
   - `package.json` with `name`, `version`, `main/module/types`, `peerDependencies`, and `publishConfig.access: "restricted"` for private packages.
   - Vite library build (`npm run build`) producing `dist/`.
   - Tests (`npm test`) and linting (`npm run lint`) passing.
2. Confirm that `files` in `package.json` only include publishable artifacts (e.g. `"files": ["dist", "README.md"]`).

### 2. Configure `.npmrc` for your registry

You need **two layers** of configuration:[^2][^3][^4][^1]

- **Project-level `.npmrc`** (checked in): declares the registry URL (and scope) but no secrets.
- **User-level `~/.npmrc` or CI environment**: holds authentication token using `${NODE_AUTH_TOKEN}` or `${NPM_TOKEN}`.

#### GitHub Packages project `.npmrc`

```ini
@scope:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

- In CI, `NODE_AUTH_TOKEN` comes from `GITHUB_TOKEN` or a PAT with `write:packages` scope.[^5][^6][^4][^2]

#### Azure Artifacts project `.npmrc`

```ini
registry=https://registry.npmjs.org/
@scope:registry=https://pkgs.dev.azure.com/ORG/PROJECT/_packaging/FEED/npm/registry/
```

And user-level `~/.npmrc` (local dev only):[^3][^1]

```ini
//pkgs.dev.azure.com/ORG/PROJECT/_packaging/FEED/npm/registry/:_authToken=${AZURE_PAT}
//pkgs.dev.azure.com/ORG/PROJECT/_packaging/FEED/npm/:_authToken=${AZURE_PAT}
email=user@example.com
always-auth=true
```

> For Azure Artifacts, Microsoft explicitly recommends splitting feed URL and credentials across project and user `.npmrc` to avoid committing tokens.[^1][^3]

### 3. Local developer workflow to publish

This is what a **maintainer** (not every dev) does locally when cutting a version:

1. Update code, tests, and docs.
2. Bump version in `package.json` (manually or via Changesets).
3. Ensure `.npmrc` is correctly configured for your registry and token.
4. Run:

   ```bash
   npm ci
   npm run lint
   npm test
   npm run build
   ```

5. Dry-run publish (optional):

   ```bash
   npm publish --dry-run
   ```

6. Publish for real:

   ```bash
   npm publish
   ```

7. Tag the release in git (e.g. `git tag vX.Y.Z && git push --tags`).

In most enterprises, this manual flow is replaced by CI/CD jobs that run on `main` merges or tags.

### 4. CI-based automated publishing (GitHub Actions example)

For a GitHub-hosted repo publishing to **GitHub Packages**:[^6][^4][^2][^5]

1. Store no credentials in `.npmrc`; reference `${NODE_AUTH_TOKEN}` instead.
2. Configure workflow:

```yaml
name: Publish Private Package

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://npm.pkg.github.com

      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

      - name: Publish to GitHub Packages
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm publish
```

- `setup-node` writes an `.npmrc` on the runner that references `NODE_AUTH_TOKEN` for authentication.[^5][^6]
- `GITHUB_TOKEN` is automatically provided and can be used as package token when the workflow has `packages: write` permission.[^4][^5]

### 5. CI-based automated publishing (Azure Pipelines + Azure Artifacts)

For a repo using Azure Pipelines and publishing to **Azure Artifacts**:[^7][^3][^1]

```yaml
trigger:
  tags:
    include:
      - 'v*.*.*'

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'

  - script: |
      npm ci
      npm run lint
      npm test
      npm run build
    displayName: 'Install and build'

  - task: Npm@1
    displayName: 'Publish to Azure Artifacts'
    inputs:
      command: 'publish'
      workingDir: '$(System.DefaultWorkingDirectory)'
      publishRegistry: 'useFeed'
      publishFeed: 'ORG/FEED'
```

- Azure’s `Npm@1` task wires credentials to the feed automatically based on project permissions.[^3][^7]
- The feed is created first in the Azure DevOps UI under **Artifacts → Create feed**.[^7][^3]

### 6. Consumer app workflow (`npm install`)

For **any** private registry, consumers need only:

1. A project-level `.npmrc` pointing `@scope` to the registry.
2. A user-level token or CI token environment variable configured.
3. Then run:

   ```bash
   npm install @scope/ui-library
   ```

4. Use in code:

   ```tsx
   import { Button } from '@scope/ui-library';
   ```

The same app can point to different registries in different environments simply by adjusting `.npmrc` or environment variables.

***

## Comparison: GitHub Packages vs Azure Artifacts for Private npm

This section compares **GitHub Packages (npm registry)** and **Azure Artifacts (npm feed)** specifically for hosting your private UI library.

### High-level feature comparison

| Dimension | GitHub Packages (npm) | Azure Artifacts (npm feed) |
|----------|------------------------|----------------------------|
| Primary ecosystem | GitHub repos & Actions | Azure DevOps (Repos, Pipelines, Boards) |
| Supported formats | npm, NuGet, Docker, Maven, etc.[^2][^8] | npm, NuGet, Maven, Python, etc.[^3][^8] |
| Auth model | GitHub users/teams, PATs, `GITHUB_TOKEN` in Actions.[^2][^9][^5] | Azure AD users/groups, PATs, service connections, build service identities.[^1][^3][^9] |
| Permissions | Repo/Org-level package permissions; private packages per org/repo.[^2][^9] | Fine-grained feed permissions (Reader/Contributor/Owner) and project/org scope.[^3] |
| UI and governance | Integrated into GitHub UI per repo/org; simple but less hierarchical.[^2][^9][^10] | Feeds grouped under projects/organizations with role-based access and policies.[^9][^3][^8] |
| CI integration | First-class with GitHub Actions via `actions/setup-node` and `GITHUB_TOKEN`.[^2][^5][^6][^4] | First-class with Azure Pipelines via `Npm@1` tasks and service connections.[^3][^7][^8] |
| Typical use case | Teams already on GitHub for source and CI; simple org structure. | Enterprises already invested in Azure DevOps for boards/pipelines and centralized artifacts. |

### Security & access control

**GitHub Packages**

- Auth uses GitHub identities; package access can be restricted to the org, selected repositories, or public.[^9][^2]
- CI uses `GITHUB_TOKEN` or PAT with `read:packages` / `write:packages` scopes, injected as `NODE_AUTH_TOKEN` in `.npmrc`.[^2][^6][^5]
- Pros:
  - Simple if devs already have GitHub accounts.
  - Fine-grained repository-based permissions.
- Cons:
  - Governance is tied to GitHub’s orgs/teams; if the rest of the company lives in Azure AD + Azure DevOps, there is tool sprawl.[^8][^9]

**Azure Artifacts**

- Auth via Azure AD and PATs; feeds can be scoped per project or org with detailed roles (Reader/Contributor/Owner).[^1][^3]
- Build services get automatic feed access when the feed is created.[^3]
- Pros:
  - Strong enterprise integration and RBAC aligned with Azure DevOps.[^9][^8]
  - Centralized place for all package types.
- Cons:
  - Additional onboarding if teams spend most time in GitHub.
  - Slightly more complex `.npmrc` setup for developers unfamiliar with Azure feeds.[^1][^3]

### Cost & limits

- **GitHub Packages**: Storage and data transfer rely on GitHub’s pricing model; there are free quotas and additional charges for large usage on private repos.[^2]
- **Azure Artifacts**: Included with Azure DevOps with certain free limits; beyond that, charges are usually per GB of stored artifacts / per user.[^8][^3]

For a single internal UI library, both options are typically low-cost in practice; differences matter more when you host thousands of packages or very large binaries.

### CI/CD integration & developer experience

**GitHub Packages**

- `actions/setup-node` writes an `.npmrc` that points to `npm.pkg.github.com` and uses `NODE_AUTH_TOKEN`, making publishing and consuming straightforward.[^6][^4][^5]
- One YAML workflow can run build, tests, Storybook, versioning, tagging, and npm publish.
- Developers often experience minimal friction if they already use GitHub for cloning and PRs.

**Azure Artifacts**

- Azure Pipelines has an `Npm@1` task that handles feed auth and publish; developers just run `npm publish` locally when needed.[^7][^3]
- For GitHub-based repos using Azure Artifacts, CI can either run in Azure Pipelines (using GitHub as an external repo) or in GitHub Actions with a PAT configured for Azure feeds.[^9][^8]

### Governance and enterprise fit

- **Azure Artifacts** aligns with enterprises that want **centralized policy** over packages, integrated with Boards, Pipelines, and Azure AD; good for strict compliance and uniform auditing.[^8][^9][^3]
- **GitHub Packages** is often better for product/dev teams that want minimal friction and live natively in GitHub repos and Actions.[^2][^9]

### Recommended choice patterns

- **Choose GitHub Packages if**:
  - Source code and CI are on GitHub.
  - Teams prefer GitHub Actions and minimal ceremony.
  - You don’t have strong central governance requirements over artifacts.

- **Choose Azure Artifacts if**:
  - Your company standardizes on Azure DevOps for CI/CD and project tracking.
  - You need fine-grained feed structure and enterprise-wide control.
  - Security and compliance teams are already invested in Azure.

- **Hybrid**:
  - Keep source and day-to-day CI on GitHub.
  - Publish official releases from Azure Pipelines into Azure Artifacts, using GitHub as the external repo source.[^9][^8]
  - This can satisfy central governance while preserving GitHub-centric developer workflows.

***

## Summary

- The **developer workflow** for publishing a private npm package is nearly identical for GitHub Packages and Azure Artifacts: configure `.npmrc`, authenticate with a token, run build/tests, then `npm publish`, ideally automated via CI.
- The **main differences** between GitHub Packages and Azure Artifacts are organizational: identity provider, permission model, UI/UX, and how deeply package management is integrated into the rest of your DevOps tooling.[^3][^8][^9]
- For a React UI design system, select the registry that best matches your org’s **primary DevOps platform** (GitHub or Azure DevOps), and keep the library’s build and publish scripts registry-agnostic so you can switch later if needed.

---

## References

1. [Connect to an Azure Artifacts feed - npm - Microsoft Learn](https://learn.microsoft.com/en-us/azure/devops/artifacts/npm/npmrc?view=azure-devops) - To authenticate with Azure Artifacts, you need to configure your npmrc config file. This file stores...

2. [Working with the npm registry - GitHub Docs](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) - You can use an .npmrc file to configure the scope mapping for your project. In the .npmrc file, use ...

3. [Publish and download npm packages with Azure Artifacts - Microsoft Learn](https://learn.microsoft.com/en-us/azure/devops/artifacts/get-started-npm?view=azure-devops) - This quickstart guides you through creating a feed, configuring your project, and managing npm packa...

4. [Publish NPM Package to GitHub Packages Registry - GitHub Actions](https://www.neteye-blog.com/2024/09/publish-npm-package-to-github-packages-registry-with-github-actions/) - Instead of hard-coding the GitHub token in the .npmrc file, you use ${NODE_AUTH_TOKEN} . This token ...

5. [Publishing Node.js packages](https://docs.github.com/actions/publishing-packages/publishing-nodejs-packages) - This example stores the NPM_TOKEN secret in the NODE_AUTH_TOKEN environment variable. When the setup...

6. [github actions - What's the difference between `NODE_AUTH_TOKEN ...](https://stackoverflow.com/questions/75766122/whats-the-difference-between-node-auth-token-and-npm-auth-token) - The NODE_AUTH_TOKEN is an environment variable with your NPM_TOKEN secret. Ultimately this is used t...

7. [Publishing npm packages in Azure Artifacts Registry - Nitor Infotech](https://www.nitorinfotech.com/blog/publishing-npm-packages-in-azure-artifacts-registry/) - In this blog, you'll see how to publish npm package of Angular library project into Azure Artifacts ...

8. [Azure DevOps vs GitHub: Which DevOps Tool Should You Choose?](https://www.sitepoint.com/azure-devops-vs-github/) - We compare Azure DevOps and GitHub, looking at core features, strengths, and weaknesses, and which i...

9. [Key differences between Azure DevOps and GitHub](https://docs.github.com/en/migrations/ado/key-differences-between-azure-devops-and-github) - Core workflows like repository access, authentication, and pull requests differ after moving from Az...

10. [GitHub packages vs Artifactory/azure devops #51102](https://github.com/orgs/community/discussions/51102) - How does GitHub packages compare to Artifactory and azure devops feeds? Artifactory and azure devops...

