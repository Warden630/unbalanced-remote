# unbalanced-remote

`unbalanced-remote` is a fork of the Unraid plugin
[unbalanced](https://github.com/jbrodriguez/unbalance). It installs beside the
original plugin and adds support for scattering data to or from already mounted
SMB/NFS locations.

Chinese documentation is available in [README.zh-CN.md](README.zh-CN.md).

## Why This Fork Exists

The original `unbalanced` is focused on moving data between Unraid array/cache
disks. This fork is for users who also have network shares mounted on the Unraid
host and want to use them as Scatter sources or targets.

Typical examples:

- Move media from a cache/NVMe disk to a NAS share mounted under `/mnt/remotes`.
- Move selected folders from an NFS/SMB mount back to an Unraid disk.
- Clean up unwanted files or empty folders from local disks or mounted shares.

## Installation

Manual install URL:

```text
https://github.com/Warden630/unbalanced-remote/releases/latest/download/unbalanced-remote.plg
```

In the Unraid Web GUI:

1. Go to **Plugins**.
2. Choose **Install Plugin**.
3. Paste the URL above.
4. Install the plugin.

The plugin installs as `unbalanced-remote`, uses port `7091` by default, and
keeps separate config, log, and history files. It can be installed at the same
time as the original `unbalanced` plugin.

## Features

- **Scatter to/from mounted SMB/NFS shares**: Existing mounts under `/mnt`, such
  as Unassigned Devices mounts under `/mnt/remotes`, `/mnt/disks`, or
  `/mnt/addons`, are shown together with local disks.
- **No gather-to-remote behavior**: Gather remains local-disk only.
- **Remote-safe rsync flags**: When either side of a Scatter transfer is remote,
  the transfer avoids xattrs, owner, group, and permission preservation that many
  SMB/NFS mounts cannot support.
- **Mixed local/remote planning**: Local XFS/Btrfs disks still use block-aware
  capacity planning, while remote mounts use byte-based planning.
- **Cleanup page**: Select files or folders by disk/mount, review file count,
  folder count, total size, and disk path, then permanently delete after a second
  confirmation.
- **Parallel install**: The binary, plugin page, config files, logs, and history
  are named separately from the original plugin.

## Supported Remote Mounts

This fork is intended for SMB and NFS mounts that already exist on the Unraid
host. It does not create or manage network mounts for you.

Before opening `unbalanced-remote`, mount the share with Unassigned Devices or
your preferred Unraid method. The mount must be under `/mnt`.

Common supported paths:

- `/mnt/remotes/...`
- `/mnt/disks/...`
- `/mnt/addons/...`

Only mounted paths with SMB/CIFS or NFS filesystem types are treated as remote
disks.

## Cleanup Safety

Cleanup deletes files permanently. There is no recycle bin.

The UI shows a review page before deletion, then asks for final confirmation
with:

- selected folder count
- selected file count
- contained folder count
- contained file count
- total size

The backend also rejects unsafe paths, root mount paths such as `/mnt` and
`/mnt/user`, and deletion attempts while another operation is running.

## Running

After installation, open the plugin from:

- **Settings > Utilities > unbalanced-remote**
- **Plugins > Installed Plugins > unbalanced-remote**
- `http://<your-unraid-host>:7091/`

## Building Locally

Requirements:

- Go 1.26+
- Node.js and npm

Build the frontend and run tests:

```bash
npm --prefix ui run build
go test ./...
```

Build a Linux amd64 binary:

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
  -ldflags "-X main.Version=2026.04.28-remote" \
  -o unbalanced-remote
```

## Release

Maintainers can create a GitHub release through the workflow in
`.github/workflows/release.yml`, or locally with:

```bash
./meta/scripts/deploy
```

Release assets:

- `unbalanced-remote.plg`
- `unbalanced-remote-<version>.tgz`

## Credits

This fork is based on
[jbrodriguez/unbalance](https://github.com/jbrodriguez/unbalance).

Original unbalanced author: Juan B. Rodriguez.

Remote scatter and cleanup fork: Walden.

License: MIT.
