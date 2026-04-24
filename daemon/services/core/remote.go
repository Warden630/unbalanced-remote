package core

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
	"syscall"

	"unbalance/daemon/domain"
	"unbalance/daemon/logger"
)

const (
	remoteDiskType   = "Remote"
	remoteDiskStatus = "REMOTE_OK"
)

var remoteFSTypes = map[string]bool{
	"cifs":        true,
	"davfs":       true,
	"fuse.rclone": true,
	"fuse.sshfs":  true,
	"fuse.webdav": true,
	"nfs":         true,
	"nfs4":        true,
	"rclone":      true,
	"smbfs":       true,
	"smb3":        true,
	"sshfs":       true,
}

type mountInfo struct {
	mountPoint string
	fsType     string
	source     string
}

func appendRemoteDisks(disks []*domain.Disk) []*domain.Disk {
	mounts, err := readMountInfo("/proc/self/mountinfo")
	if err != nil {
		logger.Yellow("remote-mounts:not-available:(%s)", err)
		return disks
	}

	seen := make(map[string]bool)
	maxID := uint64(0)
	for _, disk := range disks {
		seen[disk.Path] = true
		if disk.ID > maxID {
			maxID = disk.ID
		}
	}

	sort.Slice(mounts, func(i, j int) bool {
		return mounts[i].mountPoint < mounts[j].mountPoint
	})

	for _, mount := range mounts {
		if !isRemoteMount(mount) || seen[mount.mountPoint] {
			continue
		}

		var stat syscall.Statfs_t
		if err := syscall.Statfs(mount.mountPoint, &stat); err != nil {
			logger.Yellow("remote-mount:statfs:(%s):(%s)", mount.mountPoint, err)
			continue
		}

		maxID++
		disk := &domain.Disk{
			ID:          maxID,
			Name:        remoteDiskName(mount.mountPoint),
			Path:        mount.mountPoint,
			Device:      mount.source,
			Type:        remoteDiskType,
			FsType:      mount.fsType,
			Free:        stat.Bavail * uint64(stat.Bsize),
			Size:        stat.Blocks * uint64(stat.Bsize),
			Serial:      mount.mountPoint,
			Status:      remoteDiskStatus,
			Remote:      true,
			BlocksTotal: stat.Blocks,
			BlocksFree:  stat.Bavail,
		}

		disks = append(disks, disk)
		seen[disk.Path] = true
	}

	return disks
}

func readMountInfo(location string) ([]mountInfo, error) {
	content, err := os.ReadFile(location)
	if err != nil {
		return nil, err
	}

	mounts := make([]mountInfo, 0)
	for _, line := range strings.Split(string(content), "\n") {
		if line == "" {
			continue
		}

		parts := strings.SplitN(line, " - ", 2)
		if len(parts) != 2 {
			continue
		}

		left := strings.Fields(parts[0])
		right := strings.Fields(parts[1])
		if len(left) < 5 || len(right) < 2 {
			continue
		}

		mounts = append(mounts, mountInfo{
			mountPoint: decodeMountInfoPath(left[4]),
			fsType:     right[0],
			source:     decodeMountInfoPath(right[1]),
		})
	}

	return mounts, nil
}

func decodeMountInfoPath(value string) string {
	replacer := strings.NewReplacer(
		`\040`, " ",
		`\011`, "\t",
		`\012`, "\n",
		`\134`, `\`,
	)
	return replacer.Replace(value)
}

func isRemoteMount(mount mountInfo) bool {
	if !remoteFSTypes[mount.fsType] {
		return false
	}

	clean := filepath.Clean(mount.mountPoint)
	return clean == "/mnt" || strings.HasPrefix(clean, "/mnt/")
}

func remoteDiskName(mountPoint string) string {
	clean := filepath.Clean(mountPoint)
	name := strings.TrimPrefix(clean, "/mnt/")
	if name == clean {
		name = filepath.Base(clean)
	}
	return name
}

func localDisks(disks []*domain.Disk) []*domain.Disk {
	result := make([]*domain.Disk, 0, len(disks))
	for _, disk := range disks {
		if disk.Remote {
			continue
		}
		result = append(result, disk)
	}
	return result
}

func planBlockSize(defaultBlockSize uint64, disks ...*domain.Disk) uint64 {
	for _, disk := range disks {
		if disk != nil && disk.Remote {
			return 0
		}
	}
	return defaultBlockSize
}
