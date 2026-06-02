# unbalanced-remote 交接记录

日期：2026-06-02

## 仓库信息

本地路径：

```text
/Users/lixiang/Documents/Codex/2026-04-27/github-codex-remote-scatter-mounts-fork
```

GitHub 仓库：

```text
https://github.com/Warden630/unbalanced-remote
```

2026-06-02 检查时的本地状态：

- 当前分支：`remote-scatter-mounts`
- 当前提交：`4f161b0bfc98b0c07f7f2db73d3368cbc789e8fb`
- `origin/remote-scatter-mounts`：同一个提交
- `origin/main`：同一个提交
- 工作区：干净
- 未跟踪文件：无

最近几个相关提交：

```text
4f161b0 Use generic documentation examples
ebf5764 Rename public project links
686b582 Add remote scatter cleanup fork
d4f3c3d Add Scatter support for remote mounted directories
```

## 历史聊天记录

当时的聊天记录不在仓库文件里，而是在 Codex 线程历史中。

主线程：

```text
019dcf0a-7c16-7260-88ad-f238c1f50a68
标题：检查网络挂载 scatter 支持
目录：/Users/lixiang/Documents/Codex/2026-04-27/github-codex-remote-scatter-mounts-fork
```

这条线程包含：检查 fork、修实现、打包、发布、重命名公开仓库、把公开文档里的真实 IP/目录名示例脱敏。

更早的审查线程：

```text
019dceff-3211-7881-b0b8-3789d3dbc800
标题：检查 unbalanced 网络挂载支持
目录：/Users/lixiang/Documents/Codex/2026-04-27/github-unraid-unbalanced-unraid
```

那条线程里的初始问题包括：

- Scatter 原来使用 `disk.name`，后端再拼成 `/mnt/<name>`，无法正确匹配 `/mnt/disks/<name>` 和 `/mnt/remotes/<name>`。
- 早期 Unassigned Devices JSON 方案有风险，可能把不可用、离线、只读或未挂载的记录加入规划。
- 远程挂载点的显示名需要规范化，否则前端状态、选择项和后端路径匹配容易不一致。

## 这个 fork 的目的

`unbalanced-remote` 是 Unraid 插件 `unbalanced` 的并行安装 fork。它不会覆盖原版插件，二进制、页面、配置、日志、历史记录和默认端口都独立。

主要目标：

- 让 Scatter 可以使用 Unraid 上已经挂载好的 SMB/NFS 等远程挂载点。
- Gather 保持只支持本地磁盘。
- 增加 Cleanup 页面，用于先审查再永久删除本地或远程挂载点里的文件/文件夹。

常见支持路径：

```text
/mnt/remotes/...
/mnt/disks/...
/mnt/addons/...
```

插件不会创建 SMB/NFS 挂载。远程共享必须已经在 Unraid 主机上挂载完成。

## 核心实现

远程磁盘发现逻辑：

```text
daemon/services/core/remote.go
```

它读取 `/proc/self/mountinfo`，只保留已知远程文件系统类型，并且只接受 `/mnt` 下的挂载点。已知类型包括 CIFS/SMB、NFS、sshfs、rclone、WebDAV 及相关名称。

远程磁盘会追加到普通 Unraid 磁盘列表：

```text
daemon/services/core/array.go
```

本地 array/cache 磁盘仍然来自 `/var/local/emhttp/disks.ini` 和 `df --block-size=1 /mnt/*`。本地磁盘收集完之后，通过 `appendRemoteDisks(disks)` 把远程挂载点加入列表，并设置 `Disk.Remote = true`。

Scatter 现在基于完整路径匹配，不再靠 `/mnt/<name>` 拼路径：

```text
daemon/services/core/scatter.go
```

关键点：

- `scatterPlanPrepare` 通过 `resolveStoragePath` 解析 source 和 targets。
- `plan.VDisks` 以 `disk.Path` 作为 key。
- 远程目标规划使用 byte 级容量计算，`diskBlockSize` 对远程盘返回 `0`。
- 当传输任一端是远程挂载点时，会通过 `remoteRsyncArgs` 调整 rsync 参数。
- 远程传输会去掉 xattr 保留，并补充：

```text
--no-perms --no-owner --no-group
```

Gather 仍然保持本地磁盘逻辑，通过 `localDisks(...)` 等逻辑避免把远程盘纳入 Gather。不要在没有重新审查 planner 和删除语义的情况下直接打开 Gather-to-remote。

Cleanup 后端：

```text
daemon/services/core/cleanup.go
```

安全约束：

- Cleanup source 必须位于 `/mnt/` 下。
- 拒绝 `/mnt`、`/mnt/user`、绝对 item path、`..`、以及任何逃出 source 的目标。
- 删除使用 `os.RemoveAll`，是永久删除。

Cleanup 相关 UI / 状态入口：

```text
ui/src/flows/cleanup/cleanup.tsx
ui/src/state/cleanup.tsx
daemon/domain/cleanup.go
```

## UI 相关

UI 是 React + TypeScript + Vite，目录：

```text
ui/
```

常用文件：

```text
ui/src/flows/scatter/scatter.tsx
ui/src/flows/gather/gather.tsx
ui/src/flows/cleanup/cleanup.tsx
ui/src/shared/panel/panel.tsx
ui/src/shared/footer/footer.tsx
ui/src/state/unraid.tsx
ui/src/types.tsx
```

历史上修过一个 Cleanup confirm 页面布局问题：下面的深色区域比 select 页面窄，原因是 `Panel` 在 flex 父容器中没有横向撑满。修复点在：

```text
ui/src/shared/panel/panel.tsx
```

footer 版权也已经加上 `Walden`。

## 打包和发布

公开安装地址：

```text
https://github.com/Warden630/unbalanced-remote/releases/latest/download/unbalanced-remote.plg
```

当前 release/tag：

```text
2026.04.28-remote
```

本地现有发布产物：

```text
dist-unraid-remote/unbalanced-remote.plg
dist-unraid-remote/unbalanced-remote-2026.04.28-remote.plg
dist-unraid-remote/unbalanced-remote-2026.04.28-remote.tgz
dist-unraid-remote/unbalanced-remote-2026.04.28-remote-install.zip
```

仓库里还保留了旧的本地测试产物：

```text
dist-unraid/
```

里面的 `remote-test` 产物只当历史测试输出，不要作为公开发布版本使用。

`.plg` 模板：

```text
meta/template/unbalanced-remote.plg
```

部署脚本：

```text
meta/scripts/deploy
```

公开发布前一定要检查生成出的 `.plg` 使用的是 GitHub release 下载地址，而不是本地测试用的 `file://` 地址。

## 文档文件

仓库里已有用户文档：

```text
README.md
README.zh-CN.md
RELEASE_NOTES.md
meta/plugin/README.md
HANDOFF.zh-CN.md
```

`HANDOFF.zh-CN.md` 是本交接文件。

## 构建和测试命令

前端构建：

```bash
npm --prefix ui run build
```

Go 测试：

```bash
go test ./...
```

本地 release 构建：

```bash
make release
```

历史线程中，发布前跑通过的验证是：

```text
npm --prefix ui run build
go test ./...
```

## 已知风险和继续编辑前要注意的点

- 远程挂载发现依赖 `/proc/self/mountinfo`，这是 Unraid/Linux 环境逻辑，本机 macOS 无法完整验证。
- 本地磁盘发现里仍有 `df --block-size=1 /mnt/*`。如果 Unraid 上 `/mnt/*` 下有慢响应或失效挂载，刷新行为需要实机检查。
- Cleanup 是永久删除，且使用 `os.RemoveAll`。任何 Cleanup 相关改动都必须保留路径校验。
- `remoteFSTypes` 是手工维护的文件系统类型表。新增类型前最好先拿到真实 mountinfo 示例。
- `remoteDiskName` 会截掉第一个下划线前缀，例如 `/mnt/remotes/nas_media` 显示成 `media`。这是为了适配 Unassigned Devices 风格命名，但对其他命名方式可能不直观。
- Gather 是有意保持本地-only。如果要支持远程 Gather，需要作为单独设计任务处理。
- 之前推送 `.github/workflows/release.yml` 时遇到过 GitHub OAuth 缺少 `workflow` scope。除非确认授权 scope 足够，否则尽量不要改 workflow 文件。

## 建议的下一步

1. 编辑前先在仓库里跑验证：

```bash
npm --prefix ui run build
go test ./...
```

2. 如果要改远程挂载逻辑，优先给这些函数补测试：

```text
readMountInfo
decodeMountInfoPath
isRemoteMount
remoteDiskName
remoteRsyncArgs
cleanupFullPath
validateCleanupSource
```

3. 如果要改打包或发布，重新生成公开产物后检查：

```text
dist-unraid-remote/unbalanced-remote.plg
```

确认里面引用的是：

```text
https://github.com/Warden630/unbalanced-remote/releases/download/...
```

4. 如果要发布新版，建议使用新的 version/tag，不要覆盖 `2026.04.28-remote`，除非明确就是要替换旧 release。

