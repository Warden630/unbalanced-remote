# unbalanced-remote 2026.04.28-remote

## English

This release turns the fork into a parallel-install Unraid plugin named
`unbalanced-remote`.

Highlights:

- Supports Scatter with existing SMB/NFS mounts under `/mnt`.
- Keeps Gather local-disk only.
- Adds a Cleanup page for reviewed permanent deletion.
- Uses remote-compatible rsync options when either transfer side is remote.
- Keeps local disk planning block-aware when local and remote targets are mixed.
- Displays remote mount names by share suffix, for example
  `/mnt/remotes/192.168.31.3_video` as `video`.
- Uses a separate default port, config, log, and history path from the original
  `unbalanced` plugin.

Install URL:

```text
https://github.com/Warden630/unbalanced-remote/releases/latest/download/unbalanced-remote.plg
```

## 中文

这个版本把 fork 整理成可与原版并行安装的 Unraid 插件，名称为
`unbalanced-remote`。

主要变化：

- Scatter 支持 `/mnt` 下已经挂载好的 SMB/NFS 目录。
- Gather 仍然只支持本地磁盘。
- 新增 Cleanup 页面，可以先查看文件/文件夹数量和容量，再二次确认永久删除。
- 当传输任一端是远程挂载点时，使用更兼容远程 SMB/NFS 的 rsync 参数。
- 本地和远程目标混用时，本地磁盘仍然按 block 规划容量。
- 远程挂载点显示为共享名后缀，例如 `/mnt/remotes/192.168.31.3_video`
  显示为 `video`。
- 使用独立端口、配置、日志和历史记录路径，不覆盖原版 `unbalanced`。

安装地址：

```text
https://github.com/Warden630/unbalanced-remote/releases/latest/download/unbalanced-remote.plg
```
