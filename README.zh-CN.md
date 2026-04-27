# unbalanced-remote

`unbalanced-remote` 是 Unraid 插件
[unbalanced](https://github.com/jbrodriguez/unbalance) 的一个 fork。它可以和原版
`unbalanced` 同时安装，并增加了对已经挂载到 Unraid 主机上的 SMB/NFS 网络目录的
Scatter 支持。

English documentation is available in [README.md](README.md).

## 这个 fork 解决什么问题

原版 `unbalanced` 主要用于在 Unraid array/cache 磁盘之间移动数据。这个 fork 面向
已经把 NAS 或其他网络共享挂载到 Unraid 主机上的用户，让这些挂载点也可以作为
Scatter 的来源或目标。

典型用途：

- 把 cache/NVMe 上的媒体文件移动到 `/mnt/remotes` 下的 NAS 共享。
- 把 NFS/SMB 挂载点里的选中文件夹移动回 Unraid 本地磁盘。
- 在本地磁盘或远程挂载点中清理不想保留的文件、文件夹或空目录。

## 安装

手动安装地址：

```text
https://github.com/Warden630/unbalance/releases/latest/download/unbalanced-remote.plg
```

在 Unraid Web GUI 中：

1. 打开 **Plugins**。
2. 选择 **Install Plugin**。
3. 粘贴上面的地址。
4. 安装插件。

插件会以 `unbalanced-remote` 名称安装，默认端口是 `7091`，并使用独立的配置、日志和
历史记录文件。因此它可以和原版 `unbalanced` 同时安装，不会互相覆盖。

## 功能

- **Scatter 支持 SMB/NFS 挂载点**：已经挂载到 `/mnt` 下的网络目录会和本地磁盘一起
  显示，例如 Unassigned Devices 创建的 `/mnt/remotes`、`/mnt/disks` 或
  `/mnt/addons`。
- **Gather 仍然只支持本地磁盘**：这个 fork 没有把 Gather 改成远程模式。
- **远程传输使用更兼容的 rsync 参数**：当 Scatter 的 source 或 target 有一端是远程
  挂载点时，会避免保留 xattrs、owner、group 和 permissions，因为很多 SMB/NFS 挂载
  点不支持这些属性。
- **本地/远程混合规划更准确**：本地 XFS/Btrfs 磁盘仍然按 block 规划容量，远程挂载点
  使用 byte 规划容量。
- **Cleanup 页面**：按磁盘或远程挂载点选择文件/文件夹，先查看文件数、文件夹数、总
  容量和所在磁盘，再二次确认永久删除。
- **可与原版并行安装**：二进制、插件页面、配置文件、日志和历史记录都使用独立名称。

## 支持的远程挂载

这个 fork 只负责识别已经存在的 SMB/NFS 挂载点，不会帮你创建 SMB/NFS 连接。

使用前请先通过 Unassigned Devices 或其他方式把网络共享挂载到 Unraid 主机上。挂载点
必须位于 `/mnt` 下。

常见支持路径：

- `/mnt/remotes/...`
- `/mnt/disks/...`
- `/mnt/addons/...`

只有 SMB/CIFS 或 NFS 类型的挂载点会被识别为 remote disk。

## Cleanup 安全提示

Cleanup 是永久删除，没有回收站。

删除前页面会显示：

- 选中的文件夹数量
- 选中的文件数量
- 包含的文件夹数量
- 包含的文件数量
- 总容量

点击删除时还会再次弹窗确认。后端也会拒绝危险路径，例如 `/mnt`、`/mnt/user`、包含
`..` 的路径，以及插件正在执行其他任务时发起的删除请求。

## 打开插件

安装后可以通过以下方式打开：

- **Settings > Utilities > unbalanced-remote**
- **Plugins > Installed Plugins > unbalanced-remote**
- `http://<你的 Unraid 地址>:7091/`

## 本地构建

需要：

- Go 1.26+
- Node.js 和 npm

构建前端并运行测试：

```bash
npm --prefix ui run build
go test ./...
```

构建 Linux amd64 二进制：

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
  -ldflags "-X main.Version=2026.04.28-remote" \
  -o unbalanced-remote
```

## 发布

维护者可以通过 `.github/workflows/release.yml` 创建 release，也可以本地运行：

```bash
./meta/scripts/deploy
```

Release 文件：

- `unbalanced-remote.plg`
- `unbalanced-remote-<version>.tgz`

## 致谢

本 fork 基于
[jbrodriguez/unbalance](https://github.com/jbrodriguez/unbalance)。

原版 unbalanced 作者：Juan B. Rodriguez。

Remote scatter 和 cleanup fork：Walden。

许可证：MIT。
