# External plugin sources

This directory contains the source of the third-party packages selected by the Web profile. `install-web.mjs` installs these copies into the local `web` profile. It uses the checked-in build output and downloads each package's declared dependencies through the package manager. Keep the upstream licenses and update each source snapshot with its pinned commit.

| Directory | Package | Upstream source | Commit | Local changes |
|---|---|---|---|---|
| `ifclite-mcp/` | `@ifc-lite/mcp@0.29.0` | `LTplus-AG/ifc-lite`, `packages/mcp` | `4432436a34fba8720bea75f0cff4fd6fa1593f6c` | Published package manifest replaces workspace dependency ranges; original retained as `package.upstream.json`. |
| `dsh-cad/` | `dsh-cad@0.17.0` | `LAU-MARS/dsh-cad` | `41adbf26d853c7bf610ef55cf75758c6648c97d9` | Architecture session CAD tab, session refresh fixes, shared workspace path; patch: `../../local-plugins/dsh-architecture-bundle/patches/dsh-cad-local.patch`. |
| `dsh-blender-plugin/` | `dsh-blender-plugin@3.0.6` | `sixtysevenlf/dsh-blender-plugin` | `59f68b48af1055fa2688899deac44317c1f7e6dd` | Disables the idle watchdog when `autoStart` is false. |
| `dsh-media-desk/` | `dsh-media-desk@2.7.0` | `woniuniuniu/dsh-media-desk` | `605be2ffd543b83a4ae8af52756478b8f864f12c` | None. |
| `billion-context/` | `billion-context@0.1.213` | `ranxianglei/billion-context` | `133f3525c628c4b959bb79ece82af6df82e131a3` | None. |
| `dsh-cost-meter/` | `dsh-cost-meter@1.9.64` | `Han-1413141/dsh-cost-meter` | `c876735d80760fc89d88fa99c19c90c56e984c23` | None. |
| `dsh-vision-router/` | `dsh-vision-router@3.2.0` | `ysr666/dsh-vision-router` | `676c6d7a09644586fe440422a8d2fba58f0af1f3` | None. |

The pinned source is kept with build output from the exact versions installed in the Web profile. `lib/` and `dist/` let the profile load the plugins without running a build during installation. The original source and package dependencies remain available for rebuilds. The IFClite source snapshot covers the MCP package; its sibling libraries remain package dependencies. The `dsh-cad` package manifest says MIT while its upstream `LICENSE` file contains Apache-2.0; the mismatch is preserved for upstream clarification.

Run from the repository root:

```sh
node vendor/external/install-web.mjs --check
node vendor/external/install-web.mjs
```

The read-only check requires Node.js 24.9 or newer and verifies all selected package entries, patches, and Architecture runtime modules before installation. The installer repeats these checks before it changes the profile. Installation writes `file:` paths for the current checkout into `$DSH_HOME/profiles/web/package.json`; run it on the target machine from that machine's checkout instead of copying a profile manifest from another computer. Start or restart `dsh web` afterward. The profile's credentials, model settings, sessions, and working files stay in Harness home.
