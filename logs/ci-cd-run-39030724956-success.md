# GitHub Actions CI/CD Execution Log — Release v3.0.2 (SUCCESS)

- **Workflow Name**: Desktop CI/CD - Firebase Sync & Electron Release
- **Run ID**: [39030724956](https://github.com/yorren005/Y-Master-Editor/actions/runs/39030724956)
- **Job Name**: release-desktop
- **Operating System**: windows-latest
- **Outcome**: **SUCCESS (All 10 Steps Passed)**
- **Release Version Produced**: `v3.0.2`
- **Release Artifacts Published**:
  - `Y-Master-Editor-Setup-3.0.2.exe` (102,915,452 bytes ~ 98.1 MB)
  - `latest.yml` (Differential blockmap with SHA-512 hashes)
  - `Y-Master-Editor-Setup-3.0.2.exe.blockmap` (106,551 bytes)
- **GitHub Release URL**: [https://github.com/yorren005/Y-Master-Editor/releases/tag/v3.0.2](https://github.com/yorren005/Y-Master-Editor/releases/tag/v3.0.2)

---

## Step Execution Breakdown

| Step | Step Name | Status | Conclusion | Duration |
| :---: | :--- | :---: | :---: | :---: |
| **1** | Set up job | Completed | **Success** | Initialized runner |
| **2** | Run actions/checkout@v4 | Completed | **Success** | Branch checkout |
| **3** | Run actions/setup-node@v4 | Completed | **Success** | Node.js v20.x |
| **4** | Install Dependencies (`npm ci`) | Completed | **Success** | Dependencies cached & locked |
| **5** | Bump Version & Push Tag | Completed | **Success** | Bumped to v3.0.2 & pushed tag |
| **6** | Deploy Firebase Rules, Indexes & Schema | Completed | **Success** | Bash guard bypassed empty credentials safely |
| **7** | Build & Publish Desktop App + latest.yml | Completed | **Success** | Built NSIS installer & uploaded to Releases |
| **8** | Broadcast Release to Firebase | Completed | **Success** | Logged release status safely |
| **9** | Post Run actions/setup-node@v4 | Completed | **Success** | Runtime flushed |
| **10** | Complete job | Completed | **Success** | Cleaned up runner |

---

## Complete Console Output

```text
2026-10-17T11:58:49.4362949Z Current runner version: '2.337.0'
2026-10-17T11:58:49.4385290Z ##[group]Runner Image Provisioner
2026-10-17T11:58:49.4385988Z Hosted Compute Agent
2026-10-17T11:58:49.4386429Z Version: 20261002.596
2026-10-17T11:58:49.4386913Z Commit: c3d12f3313a95f25162a1503be624f3b0617f8c0
2026-10-17T11:58:49.4387472Z Build Date: 2026-10-02T22:28:27Z
2026-10-17T11:58:49.4388013Z Worker ID: {cca5b8b1-2a52-4a3b-bd1b-d10c2c51bdd2}
2026-10-17T11:58:49.4388570Z Region: westcentralus
2026-10-17T11:58:49.4388991Z Cloud: Azure
2026-10-17T11:58:49.4389391Z ##[endgroup]
2026-10-17T11:58:49.4390536Z ##[group]Operating System
2026-10-17T11:58:49.4391107Z Microsoft Windows Server 2025
2026-10-17T11:58:49.4391630Z 10.0.26100
2026-10-17T11:58:49.4392034Z Datacenter
2026-10-17T11:58:49.4392422Z ##[endgroup]
2026-10-17T11:58:49.4392853Z ##[group]Runner Image
2026-10-17T11:58:49.4393338Z Image: windows-2025-vs2026
2026-10-17T11:58:49.4393878Z Version: 20261007.264.1
2026-10-17T11:58:49.4395064Z Included Software: https://github.com/actions/runner-images/blob/win25-vs2026/20261007.264/images/windows/Windows2025-VS2026-Readme.md
2026-10-17T11:58:49.4396356Z Image Release: https://github.com/actions/runner-images/releases/tag/win25-vs2026%2F20261007.264
2026-10-17T11:58:49.4397091Z ##[endgroup]
2026-10-17T11:58:49.4397937Z ##[group]GITHUB_TOKEN Permissions
2026-10-17T11:58:49.4399733Z Contents: write
2026-10-17T11:58:49.4400569Z Metadata: read
2026-10-17T11:58:49.4401080Z ##[endgroup]
2026-10-17T11:58:49.4402803Z Secret source: Actions
2026-10-17T11:58:49.4403596Z Cache mode: write
2026-10-17T11:58:49.4404127Z Prepare workflow directory
2026-10-17T11:58:49.4716625Z Prepare all required actions
2026-10-17T11:58:49.4756289Z Getting action download info
2026-10-17T11:58:49.7190580Z Download action repository 'actions/checkout@v4' (SHA:11d5960a326750d5838078e36cf38b85af677262)
2026-10-17T11:58:49.8199575Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
2026-10-17T11:58:50.0471736Z Complete job name: release-desktop
2026-10-17T11:58:50.1595900Z ##[group]Run actions/checkout@v4
2026-10-17T11:58:50.1596740Z with:
2026-10-17T11:58:50.1599819Z   token: ***
2026-10-17T11:58:50.1600155Z   repository: yorren005/Y-Master-Editor
2026-10-17T11:58:50.1600560Z   ssh-strict: true
2026-10-17T11:58:50.1600863Z   ssh-user: git
2026-10-17T11:58:50.1601176Z   persist-credentials: true
2026-10-17T11:58:50.1601529Z   clean: true
2026-10-17T11:58:50.1601840Z   sparse-checkout-cone-mode: true
2026-10-17T11:58:50.1602205Z   fetch-depth: 1
2026-10-17T11:58:50.1602514Z   fetch-tags: false
2026-10-17T11:58:50.1602819Z   show-progress: true
2026-10-17T11:58:50.1603126Z   lfs: false
2026-10-17T11:58:50.1603410Z   submodules: false
2026-10-17T11:58:50.1603730Z   set-safe-directory: true
2026-10-17T11:58:50.1604086Z   allow-unsafe-pr-checkout: false
2026-10-17T11:58:50.1604632Z ##[endgroup]
2026-10-17T11:58:50.2853524Z Syncing repository: yorren005/Y-Master-Editor
2026-10-17T11:58:50.2854958Z ##[group]Getting Git version info
2026-10-17T11:58:50.2855522Z Working directory is 'D:\a\Y-Master-Editor\Y-Master-Editor'
2026-10-17T11:58:50.3431276Z [command]"C:\Program Files\Git\bin\git.exe" version
2026-10-17T11:58:50.6462929Z git version 2.56.0.windows.2
2026-10-17T11:58:50.6505632Z ##[endgroup]
2026-10-17T11:58:50.6522140Z Temporarily overriding HOME='D:\a\_temp\62bcb846-ba8c-40eb-b0e4-b96ba469ec0a' before making global git config changes
2026-10-17T11:58:50.6523153Z Adding repository directory to the temporary git global config as a safe directory
2026-10-17T11:58:50.6530931Z [command]"C:\Program Files\Git\bin\git.exe" config --global --add safe.directory D:\a\Y-Master-Editor\Y-Master-Editor
2026-10-17T11:58:50.7198118Z Deleting the contents of 'D:\a\Y-Master-Editor\Y-Master-Editor'
2026-10-17T11:58:50.7203707Z ##[group]Initializing the repository
2026-10-17T11:58:50.7210902Z [command]"C:\Program Files\Git\bin\git.exe" init D:\a\Y-Master-Editor\Y-Master-Editor
2026-10-17T11:58:50.8024801Z Initialized empty Git repository in D:/a/Y-Master-Editor/Y-Master-Editor/.git/
2026-10-17T11:58:50.8070170Z [command]"C:\Program Files\Git\bin\git.exe" remote add origin https://github.com/yorren005/Y-Master-Editor
2026-10-17T11:58:50.8662831Z ##[endgroup]
2026-10-17T11:58:50.8663495Z ##[group]Disabling automatic garbage collection
2026-10-17T11:58:50.8670325Z [command]"C:\Program Files\Git\bin\git.exe" config --local gc.auto 0
2026-10-17T11:58:50.8975391Z ##[endgroup]
2026-10-17T11:58:50.8975947Z ##[group]Setting up auth
2026-10-17T11:58:50.8985758Z [command]"C:\Program Files\Git\bin\git.exe" config --local --name-only --get-regexp core\.sshCommand
2026-10-17T11:58:50.9303490Z [command]"C:\Program Files\Git\bin\git.exe" submodule foreach --recursive "sh -c \"git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :\""
2026-10-17T11:58:52.2439702Z [command]"C:\Program Files\Git\bin\git.exe" config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-10-17T11:58:52.2773992Z [command]"C:\Program Files\Git\bin\git.exe" submodule foreach --recursive "sh -c \"git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :\""
2026-10-17T11:58:52.7572983Z [command]"C:\Program Files\Git\bin\git.exe" config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-10-17T11:58:52.7904432Z [command]"C:\Program Files\Git\bin\git.exe" submodule foreach --recursive "git config --local --show-origin --name-only --get-regexp remote.origin.url"
2026-10-17T11:58:53.2806728Z [command]"C:\Program Files\Git\bin\git.exe" config --local http.https://github.com/.extraheader "AUTHORIZATION: basic ***"
2026-10-17T11:58:53.3130798Z ##[endgroup]
2026-10-17T11:58:53.3131461Z ##[group]Fetching the repository
2026-10-17T11:58:53.3143716Z [command]"C:\Program Files\Git\bin\git.exe" -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +b1e0c6d1ed2ea2f1ab40b250188b65273ddde065:refs/remotes/origin/main
2026-10-17T11:58:55.2192698Z From https://github.com/yorren005/Y-Master-Editor
2026-10-17T11:58:55.2193397Z  * [new ref]         b1e0c6d1ed2ea2f1ab40b250188b65273ddde065 -> origin/main
2026-10-17T11:58:55.2228172Z ##[endgroup]
2026-10-17T11:58:55.2228814Z ##[group]Determining the checkout info
2026-10-17T11:58:55.2230851Z ##[endgroup]
2026-10-17T11:58:55.2238480Z [command]"C:\Program Files\Git\bin\git.exe" sparse-checkout disable
2026-10-17T11:58:55.2669632Z [command]"C:\Program Files\Git\bin\git.exe" config --local --unset-all extensions.worktreeConfig
2026-10-17T11:58:55.2969049Z ##[group]Checking out the ref
2026-10-17T11:58:55.2976237Z [command]"C:\Program Files\Git\bin\git.exe" checkout --progress --force -B main refs/remotes/origin/main
2026-10-17T11:58:55.4024743Z Switched to a new branch 'main'
2026-10-17T11:58:55.4077607Z branch 'main' set up to track 'origin/main'.
2026-10-17T11:58:55.4121729Z ##[endgroup]
2026-10-17T11:58:55.4579862Z [command]"C:\Program Files\Git\bin\git.exe" log -1 --format=%H
2026-10-17T11:58:55.4871998Z b1e0c6d1ed2ea2f1ab40b250188b65273ddde065
2026-10-17T11:58:55.5276448Z ##[group]Run actions/setup-node@v4
2026-10-17T11:58:55.5276761Z with:
2026-10-17T11:58:55.5276933Z   node-version: 20
2026-10-17T11:58:55.5277106Z   always-auth: false
2026-10-17T11:58:55.5277268Z   check-latest: false
2026-10-17T11:58:55.5279153Z   token: ***
2026-10-17T11:58:55.5279325Z ##[endgroup]
2026-10-17T11:58:55.6764715Z Attempting to download 20...
2026-10-17T11:58:55.6939693Z (node:9732) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
2026-10-17T11:58:55.6940614Z (Use `node --trace-deprecation ...` to show where the warning was created)
2026-10-17T11:58:56.5616558Z Acquiring 20.20.2 - x64 from https://github.com/actions/node-versions/releases/download/20.20.2-23521894959/node-20.20.2-win32-x64.7z
2026-10-17T11:58:57.0683764Z Extracting ...
2026-10-17T11:58:58.7574167Z Adding to the cache ...
2026-10-17T11:59:05.5125451Z ##[group]Environment details
2026-10-17T11:59:06.9874079Z node: v20.20.2
2026-10-17T11:59:06.9874606Z npm: 10.8.2
2026-10-17T11:59:06.9874806Z yarn: 1.22.22
2026-10-17T11:59:06.9875268Z ##[endgroup]
2026-10-17T11:59:07.0137639Z ##[group]Run npm ci
2026-10-17T11:59:07.0137969Z [36;1mnpm ci[0m
2026-10-17T11:59:07.1263154Z shell: C:\Program Files\PowerShell\7\pwsh.EXE -command ". '{0}'"
2026-10-17T11:59:07.1263470Z ##[endgroup]
2026-10-17T11:59:08.1013396Z npm warn EBADENGINE Unsupported engine {
2026-10-17T11:59:08.1014110Z npm warn EBADENGINE   package: '@electron/rebuild@4.2.0',
2026-10-17T11:59:08.1014678Z npm warn EBADENGINE   required: { node: '>=22.12.0' },
2026-10-17T11:59:08.1015268Z npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
2026-10-17T11:59:08.1015741Z npm warn EBADENGINE }
2026-10-17T11:59:08.1027753Z npm warn EBADENGINE Unsupported engine {
2026-10-17T11:59:08.1028192Z npm warn EBADENGINE   package: 'firebase-admin@14.5.0',
2026-10-17T11:59:08.1028504Z npm warn EBADENGINE   required: { node: '>=22' },
2026-10-17T11:59:08.1028848Z npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
2026-10-17T11:59:08.1029119Z npm warn EBADENGINE }
2026-10-17T11:59:08.1032323Z npm warn EBADENGINE Unsupported engine {
2026-10-17T11:59:08.1032626Z npm warn EBADENGINE   package: 'gcp-metadata@9.2.1',
2026-10-17T11:59:08.1032913Z npm warn EBADENGINE   required: { node: '>=22' },
2026-10-17T11:59:08.1033236Z npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
2026-10-17T11:59:08.1033529Z npm warn EBADENGINE }
2026-10-17T11:59:08.1034449Z npm warn EBADENGINE Unsupported engine {
2026-10-17T11:59:08.1034716Z npm warn EBADENGINE   package: 'gaxios@8.3.1',
2026-10-17T11:59:08.1035024Z npm warn EBADENGINE   required: { node: '>=22' },
2026-10-17T11:59:08.1035392Z npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
2026-10-17T11:59:08.1035667Z npm warn EBADENGINE }
2026-10-17T11:59:08.1038635Z npm warn EBADENGINE Unsupported engine {
2026-10-17T11:59:08.1038939Z npm warn EBADENGINE   package: 'google-auth-library@11.3.1',
2026-10-17T11:59:08.1039240Z npm warn EBADENGINE   required: { node: '>=22' },
2026-10-17T11:59:08.1039788Z npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
2026-10-17T11:59:08.1040071Z npm warn EBADENGINE }
2026-10-17T11:59:08.1040337Z npm warn EBADENGINE Unsupported engine {
2026-10-17T11:59:08.1041083Z npm warn EBADENGINE   package: 'gaxios@8.3.1',
2026-10-17T11:59:08.1041369Z npm warn EBADENGINE   required: { node: '>=22' },
2026-10-17T11:59:08.1041690Z npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
2026-10-17T11:59:08.1041947Z npm warn EBADENGINE }
2026-10-17T11:59:08.1042209Z npm warn EBADENGINE Unsupported engine {
2026-10-17T11:59:08.1043060Z npm warn EBADENGINE   package: 'google-logging-utils@2.1.0',
2026-10-17T11:59:08.1043389Z npm warn EBADENGINE   required: { node: '>=22' },
2026-10-17T11:59:08.1043819Z npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
2026-10-17T11:59:08.1044122Z npm warn EBADENGINE }
2026-10-17T11:59:08.1049567Z npm warn EBADENGINE Unsupported engine {
2026-10-17T11:59:08.1049844Z npm warn EBADENGINE   package: 'node-abi@4.35.0',
2026-10-17T11:59:08.1050139Z npm warn EBADENGINE   required: { node: '>=22.12.0' },
2026-10-17T11:59:08.1050472Z npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
2026-10-17T11:59:08.1050729Z npm warn EBADENGINE }
2026-10-17T11:59:10.1312068Z npm warn deprecated rimraf@2.6.3: Rimraf versions prior to v4 are no longer supported
2026-10-17T11:59:12.3536562Z npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
2026-10-17T11:59:13.2121412Z npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
2026-10-17T11:59:13.6130035Z npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
2026-10-17T11:59:14.7644050Z npm warn deprecated boolean@3.2.0: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
2026-10-17T11:59:15.6388337Z npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
2026-10-17T11:59:17.6673073Z npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
2026-10-17T11:59:39.6454789Z npm warn cleanup Failed to remove some directories [
2026-10-17T11:59:39.6455230Z npm warn cleanup   [
2026-10-17T11:59:39.6455728Z npm warn cleanup     'D:\\a\\Y-Master-Editor\\Y-Master-Editor\\node_modules\\google-gax',
2026-10-17T11:59:39.6456797Z npm warn cleanup     [Error: EPERM: operation not permitted, rmdir 'D:\a\Y-Master-Editor\Y-Master-Editor\node_modules\google-gax\node_modules\@grpc\grpc-js\proto\xds'] {
2026-10-17T11:59:39.6457584Z npm warn cleanup       errno: -4048,
2026-10-17T11:59:39.6457914Z npm warn cleanup       code: 'EPERM',
2026-10-17T11:59:39.6458243Z npm warn cleanup       syscall: 'rmdir',
2026-10-17T11:59:39.6459060Z npm warn cleanup       path: 'D:\\a\\Y-Master-Editor\\Y-Master-Editor\\node_modules\\google-gax\\node_modules\\@grpc\\grpc-js\\proto\\xds'
2026-10-17T11:59:39.6459747Z npm warn cleanup     }
2026-10-17T11:59:39.6460020Z npm warn cleanup   ],
2026-10-17T11:59:39.6460272Z npm warn cleanup   [
2026-10-17T11:59:39.6460989Z npm warn cleanup     'D:\\a\\Y-Master-Editor\\Y-Master-Editor\\node_modules\\@google-cloud\\firestore-api\\node_modules\\google-gax',
2026-10-17T11:59:39.6462466Z npm warn cleanup     [Error: EPERM: operation not permitted, rmdir 'D:\a\Y-Master-Editor\Y-Master-Editor\node_modules\@google-cloud\firestore-api\node_modules\google-gax\build\protos'] {
2026-10-17T11:59:39.6463415Z npm warn cleanup       errno: -4048,
2026-10-17T11:59:39.6463770Z npm warn cleanup       code: 'EPERM',
2026-10-17T11:59:39.6464141Z npm warn cleanup       syscall: 'rmdir',
2026-10-17T11:59:39.6465072Z npm warn cleanup       path: 'D:\\a\\Y-Master-Editor\\Y-Master-Editor\\node_modules\\@google-cloud\\firestore-api\\node_modules\\google-gax\\build\\protos'
2026-10-17T11:59:39.6465847Z npm warn cleanup     }
2026-10-17T11:59:39.6466129Z npm warn cleanup   ]
2026-10-17T11:59:39.6466396Z npm warn cleanup ]
2026-10-17T11:59:39.7246329Z 
2026-10-17T11:59:39.7247131Z added 514 packages, and audited 515 packages in 32s
2026-10-17T11:59:39.7247500Z 
2026-10-17T11:59:39.7247647Z 79 packages are looking for funding
2026-10-17T11:59:39.7248008Z   run `npm fund` for details
2026-10-17T11:59:40.0841406Z 
2026-10-17T11:59:40.0841945Z 18 vulnerabilities (8 moderate, 10 high)
2026-10-17T11:59:40.0842294Z 
2026-10-17T11:59:40.0842466Z To address issues that do not require attention, run:
2026-10-17T11:59:40.0842753Z   npm audit fix
2026-10-17T11:59:40.0842855Z 
2026-10-17T11:59:40.0843007Z To address all issues (including breaking changes), run:
2026-10-17T11:59:40.0843265Z   npm audit fix --force
2026-10-17T11:59:40.0843378Z 
2026-10-17T11:59:40.0843475Z Run `npm audit` for details.
2026-10-17T11:59:40.2137718Z ##[group]Run git config user.name "github-actions[bot]"
2026-10-17T11:59:40.2138105Z [36;1mgit config user.name "github-actions[bot]"[0m
2026-10-17T11:59:40.2138459Z [36;1mgit config user.email "github-actions[bot]@users.noreply.github.com"[0m
2026-10-17T11:59:40.2138823Z [36;1mnpm version patch -m "chore(release): v%s [skip ci]"[0m
2026-10-17T11:59:40.2139093Z [36;1mgit push origin main --follow-tags[0m
2026-10-17T11:59:40.2151862Z shell: C:\Program Files\Git\bin\bash.EXE --noprofile --norc -e -o pipefail {0}
2026-10-17T11:59:40.2152180Z ##[endgroup]
2026-10-17T11:59:41.3250869Z v3.0.2
2026-10-17T11:59:43.0298576Z To https://github.com/yorren005/Y-Master-Editor
2026-10-17T11:59:43.0298939Z    b1e0c6d..d0c7642  main -> main
2026-10-17T11:59:43.0299178Z  * [new tag]         v3.0.2 -> v3.0.2
2026-10-17T11:59:43.0840818Z ##[group]Run if [ -z "$FIREBASE_SERVICE_ACCOUNT" ]; then
2026-10-17T11:59:43.0841272Z [36;1mif [ -z "$FIREBASE_SERVICE_ACCOUNT" ]; then[0m
2026-10-17T11:59:43.0841665Z [36;1m  echo "FIREBASE_SERVICE_ACCOUNT secret not configured, skipping Firebase rules deploy."[0m
2026-10-17T11:59:43.0842008Z [36;1melse[0m
2026-10-17T11:59:43.0842177Z [36;1m  npm install -g firebase-tools[0m
2026-10-17T11:59:43.0842453Z [36;1m  echo "$FIREBASE_SERVICE_ACCOUNT" > service-account.json[0m
2026-10-17T11:59:43.0842796Z [36;1m  export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/service-account.json"[0m
2026-10-17T11:59:43.0843236Z [36;1m  firebase deploy --only firestore:rules,firestore:indexes,storage --non-interactive[0m
2026-10-17T11:59:43.0843569Z [36;1m  rm service-account.json[0m
2026-10-17T11:59:43.0843750Z [36;1mfi[0m
2026-10-17T11:59:43.0854686Z shell: C:\Program Files\Git\bin\bash.EXE --noprofile --norc -e -o pipefail {0}
2026-10-17T11:59:43.0854990Z env:
2026-10-17T11:59:43.0855198Z   FIREBASE_SERVICE_ACCOUNT: 
2026-10-17T11:59:43.0855385Z ##[endgroup]
2026-10-17T11:59:43.1301809Z FIREBASE_SERVICE_ACCOUNT secret not configured, skipping Firebase rules deploy.
2026-10-17T11:59:43.1455589Z ##[group]Run npx electron-builder --publish always
2026-10-17T11:59:43.1456102Z [36;1mnpx electron-builder --publish always[0m
2026-10-17T11:59:43.1513417Z shell: C:\Program Files\PowerShell\7\pwsh.EXE -command ". '{0}'"
2026-10-17T11:59:43.1513686Z env:
2026-10-17T11:59:43.1515673Z   GH_TOKEN: ***
2026-10-17T11:59:43.1515840Z ##[endgroup]
2026-10-17T11:59:44.5507642Z   • electron-builder  version=26.15.3 os=10.0.26100
2026-10-17T11:59:44.5554784Z   • loaded configuration  file=package.json ("build" field)
2026-10-17T11:59:45.4062817Z   • executing @electron/rebuild  electronVersion=33.4.11 arch=x64 buildFromSource=false workspaceRoot=D:\a\Y-Master-Editor\Y-Master-Editor projectDir=./ appDir=./
2026-10-17T11:59:45.4063857Z   • installing native dependencies  arch=x64
2026-10-17T11:59:45.6693896Z   • completed installing native dependencies
2026-10-17T11:59:45.6753096Z   • packaging       platform=win32 arch=x64 electron=33.4.11 appOutDir=dist\win-unpacked
2026-10-17T11:59:46.0069237Z   • downloaded      label=electron progress=100%
2026-10-17T11:59:48.1547256Z   • downloaded electron zip extracted successfully  output=D:\a\Y-Master-Editor\Y-Master-Editor\dist\win-unpacked
2026-10-17T11:59:48.1726730Z   • searching for node modules  pm=npm searchDir=D:\a\Y-Master-Editor\Y-Master-Editor
2026-10-17T11:59:51.9000014Z   • duplicate dependency references  dependencies=["ajv@8.20.0","debug@4.4.3","express@5.3.0","express@5.3.0","http-errors@2.0.1","debug@4.4.3","mime-types@3.0.2","debug@4.4.3","http-errors@2.0.1","iconv-lite@0.7.3","on-finished@2.4.1","qs@6.16.0","raw-body@3.0.2","type-is@2.1.0","debug@4.4.3","on-finished@2.4.1","get-intrinsic@1.3.0","call-bind-apply-helpers@1.0.2","call-bind-apply-helpers@1.0.2","es-object-atoms@1.1.2","call-bound@1.0.4","get-intrinsic@1.3.0","side-channel-map@1.0.1","debug@4.4.3","debug@4.4.3","http-errors@2.0.1","mime-types@3.0.2","on-finished@2.4.1","send@1.2.1","mime-types@3.0.2","@firebase/app-types@0.9.6","@firebase/app@0.16.2","@firebase/util@1.15.3","@firebase/util@1.15.3","@firebase/analytics@0.10.25","@firebase/app-compat@0.5.18","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/installations@0.6.24","@firebase/logger@0.5.2","@firebase/util@1.15.3","@firebase/app-check@0.13.1","@firebase/app-compat@0.5.18","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/logger@0.5.2","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/logger@0.5.2","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/logger@0.5.2","@firebase/util@1.15.3","@firebase/logger@0.5.2","@firebase/component@0.7.5","@firebase/logger@0.5.2","@firebase/util@1.15.3","@firebase/app-compat@0.5.18","@firebase/app@0.16.2","@firebase/app-types@0.9.6","@firebase/util@1.15.3","@firebase/auth@1.13.6","@firebase/component@0.7.5","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/logger@0.5.2","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/logger@0.5.2","@firebase/util@1.15.3","@firebase/app-compat@0.5.18","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/app-types@0.9.6","@firebase/util@1.15.3","@firebase/database@1.1.5","@firebase/logger@0.5.2","@firebase/util@1.15.3","@firebase/component@0.7.5","@firebase/logger@0.5.2","@firebase/util@1.15.3","@firebase/app-compat@0.5.18","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/app-types@0.9.6","@firebase/util@1.15.3","@firebase/firestore@4.17.2","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/logger@0.5.2","@firebase/util@1.15.3","@grpc/proto-loader@0.7.15","@types/node@20.19.43","string-width@4.2.3","string-width@4.2.3","strip-ansi@6.0.1","strip-ansi@6.0.1","@firebase/app-compat@0.5.18","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/functions@0.14.0","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/util@1.15.3","@firebase/app-compat@0.5.18","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/app-types@0.9.6","@firebase/installations@0.6.24","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/util@1.15.3","@firebase/app-compat@0.5.18","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/messaging@0.13.3","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/installations@0.6.24","@firebase/util@1.15.3","@firebase/app-compat@0.5.18","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/logger@0.5.2","@firebase/performance@0.7.14","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/installations@0.6.24","@firebase/logger@0.5.2","@firebase/util@1.15.3","@firebase/app-compat@0.5.18","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/logger@0.5.2","@firebase/remote-config@0.9.2","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/installations@0.6.24","@firebase/logger@0.5.2","@firebase/util@1.15.3","@firebase/app-compat@0.5.18","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/app-types@0.9.6","@firebase/util@1.15.3","@firebase/storage@0.14.5","@firebase/util@1.15.3","@firebase/app@0.16.2","@firebase/component@0.7.5","@firebase/util@1.15.3"]
2026-10-17T12:00:01.3626149Z   • updating asar integrity executable resource  executablePath=dist\win-unpacked\Y Master Editor.exe
2026-10-17T12:00:01.6104237Z   • signing with signtool.exe  path=dist\win-unpacked\Y Master Editor.exe
2026-10-17T12:00:01.6124142Z   • building        target=nsis file=dist\Y Master Editor Setup 3.0.2.exe archs=x64 oneClick=true perMachine=false
2026-10-17T12:00:01.7712946Z   • downloaded      label=nsis-3.0.4.1.7z progress=100%
2026-10-17T12:00:02.2354002Z   • downloaded      label=7zip-win-x64.tar.gz progress=100%
2026-10-17T12:00:02.7148418Z   • signing with signtool.exe  path=dist\win-unpacked\resources\elevate.exe
2026-10-17T12:00:39.3992384Z   • downloaded      label=nsis-resources-3.4.1.7z progress=100%
2026-10-17T12:00:40.5865392Z   • signing with signtool.exe  path=dist\Y Master Editor Setup 3.0.2.__uninstaller.exe
2026-10-17T12:00:41.7141967Z   • signing with signtool.exe  path=dist\Y Master Editor Setup 3.0.2.exe
2026-10-17T12:00:41.7143646Z   • building block map  blockMapFile=dist\Y Master Editor Setup 3.0.2.exe.blockmap
2026-10-17T12:00:44.9792091Z   • publishing      publisher=Github (owner: yorren005, project: Y-Master-Editor, version: 3.0.2)
2026-10-17T12:00:44.9794036Z   • publishing      publisher=Github (owner: yorren005, project: Y-Master-Editor, version: 3.0.2)
2026-10-17T12:00:44.9813827Z   • uploading       file=Y-Master-Editor-Setup-3.0.2.exe.blockmap provider=github
2026-10-17T12:00:44.9858498Z   • uploading       file=Y-Master-Editor-Setup-3.0.2.exe provider=github
2026-10-17T12:00:45.3007934Z   • creating GitHub release  reason=release doesn't exist tag=v3.0.2 version=3.0.2
2026-10-17T12:00:45.3625064Z   • creating GitHub release  reason=release doesn't exist tag=v3.0.2 version=3.0.2
2026-10-17T12:00:51.4295032Z ##[group]Run if [ -n "$FIREBASE_SERVICE_ACCOUNT" ]; then
2026-10-17T12:00:51.4295449Z [36;1mif [ -n "$FIREBASE_SERVICE_ACCOUNT" ]; then[0m
2026-10-17T12:00:51.4295771Z [36;1m  node scripts/broadcast-desktop-release.mjs[0m
2026-10-17T12:00:51.4296037Z [36;1melse[0m
2026-10-17T12:00:51.4296424Z [36;1m  echo "FIREBASE_SERVICE_ACCOUNT secret not configured, skipping realtime release broadcast."[0m
2026-10-17T12:00:51.4296841Z [36;1mfi[0m
2026-10-17T12:00:51.4307362Z shell: C:\Program Files\Git\bin\bash.EXE --noprofile --norc -e -o pipefail {0}
2026-10-17T12:00:51.4307720Z env:
2026-10-17T12:00:51.4307883Z   FIREBASE_SERVICE_ACCOUNT: 
2026-10-17T12:00:51.4308086Z ##[endgroup]
2026-10-17T12:00:51.4597049Z FIREBASE_SERVICE_ACCOUNT secret not configured, skipping realtime release broadcast.
2026-10-17T12:00:51.4790145Z Post job cleanup.
2026-10-17T12:00:51.5973766Z (node:9824) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
2026-10-17T12:00:51.5974503Z (Use `node --trace-deprecation ...` to show where the warning was created)
2026-10-17T12:00:51.6236651Z Post job cleanup.
2026-10-17T12:00:51.7612195Z [command]"C:\Program Files\Git\bin\git.exe" version
2026-10-17T12:00:51.7896200Z git version 2.56.0.windows.2
2026-10-17T12:00:51.7953930Z Temporarily overriding HOME='D:\a\_temp\e874dfb1-87ac-4962-a0b7-b4488a14e5c6' before making global git config changes
2026-10-17T12:00:51.7954967Z Adding repository directory to the temporary git global config as a safe directory
2026-10-17T12:00:51.7962192Z [command]"C:\Program Files\Git\bin\git.exe" config --global --add safe.directory D:\a\Y-Master-Editor\Y-Master-Editor
2026-10-17T12:00:51.8269361Z [command]"C:\Program Files\Git\bin\git.exe" config --local --name-only --get-regexp core\.sshCommand
2026-10-17T12:00:51.8568546Z [command]"C:\Program Files\Git\bin\git.exe" submodule foreach --recursive "sh -c \"git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :\""
2026-10-17T12:00:52.3328271Z [command]"C:\Program Files\Git\bin\git.exe" config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2026-10-17T12:00:52.3590781Z http.https://github.com/.extraheader
2026-10-17T12:00:52.3625332Z [command]"C:\Program Files\Git\bin\git.exe" config --local --unset-all http.https://github.com/.extraheader
2026-10-17T12:00:52.3918628Z [command]"C:\Program Files\Git\bin\git.exe" submodule foreach --recursive "sh -c \"git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :\""
2026-10-17T12:00:52.8437257Z [command]"C:\Program Files\Git\bin\git.exe" config --local --name-only --get-regexp ^includeIf\.gitdir:
2026-10-17T12:00:52.8731794Z [command]"C:\Program Files\Git\bin\git.exe" submodule foreach --recursive "git config --local --show-origin --name-only --get-regexp remote.origin.url"
2026-10-17T12:00:53.3320516Z Cleaning up orphan processes
2026-10-17T12:00:53.3355027Z ##[warning]Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: actions/checkout@v4, actions/setup-node@v4. For more information see: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/

```
