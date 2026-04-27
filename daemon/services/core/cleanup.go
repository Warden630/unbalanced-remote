package core

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"unbalance/daemon/common"
	"unbalance/daemon/domain"
	"unbalance/daemon/logger"
)

func (c *Core) CleanupPlan(setup domain.CleanupSetup) (*domain.CleanupPlan, error) {
	if c.state.Status != common.OpNeutral {
		return nil, fmt.Errorf("%s is busy", common.PluginName)
	}

	source := resolveStoragePath(setup.Source)
	if err := validateCleanupSource(source); err != nil {
		return nil, err
	}

	plan := &domain.CleanupPlan{
		Source: source,
		Items:  make([]domain.CleanupItem, 0, len(setup.Items)),
	}

	for _, itemPath := range setup.Items {
		item, err := cleanupItem(source, itemPath)
		if err != nil {
			return nil, err
		}

		plan.Items = append(plan.Items, item)
		plan.TotalFiles += item.Files
		plan.TotalFolders += item.Folders
		plan.TotalSize += item.Size
	}

	return plan, nil
}

func (c *Core) CleanupDelete(setup domain.CleanupSetup) (*domain.CleanupPlan, error) {
	plan, err := c.CleanupPlan(setup)
	if err != nil {
		return nil, err
	}

	for _, item := range plan.Items {
		logger.Blue("cleanup:deleting:(%s)", item.Full)
		if err := os.RemoveAll(item.Full); err != nil {
			return nil, err
		}
	}

	c.state.Unraid = c.refreshUnraid()
	return plan, nil
}

func validateCleanupSource(source string) error {
	clean := filepath.Clean(source)
	if clean == "/mnt" || clean == "/mnt/user" || !strings.HasPrefix(clean, "/mnt/") {
		return fmt.Errorf("unsafe cleanup source: %s", source)
	}
	return nil
}

func cleanupItem(source, itemPath string) (domain.CleanupItem, error) {
	fullPath, err := cleanupFullPath(source, itemPath)
	if err != nil {
		return domain.CleanupItem{}, err
	}

	info, err := os.Stat(fullPath)
	if err != nil {
		return domain.CleanupItem{}, err
	}

	item := domain.CleanupItem{
		Path: filepath.ToSlash(filepath.Clean(itemPath)),
		Full: fullPath,
		Disk: source,
		Name: filepath.Base(fullPath),
		Dir:  info.IsDir(),
	}

	if !item.Dir {
		item.Files = 1
		item.Size = uint64(info.Size())
		return item, nil
	}

	size, files, folders, err := cleanupDirStats(fullPath)
	if err != nil {
		return domain.CleanupItem{}, err
	}

	item.Size = size
	item.Files = files
	item.Folders = folders
	return item, nil
}

func cleanupFullPath(source, itemPath string) (string, error) {
	cleanSource := filepath.Clean(source)
	cleanItem := filepath.Clean(filepath.FromSlash(itemPath))
	if filepath.IsAbs(cleanItem) || cleanItem == "." || strings.HasPrefix(cleanItem, ".."+string(filepath.Separator)) || cleanItem == ".." {
		return "", fmt.Errorf("unsafe cleanup path: %s", itemPath)
	}

	fullPath := filepath.Clean(filepath.Join(cleanSource, cleanItem))
	if fullPath == cleanSource || !strings.HasPrefix(fullPath, cleanSource+string(filepath.Separator)) {
		return "", fmt.Errorf("unsafe cleanup target: %s", itemPath)
	}

	return fullPath, nil
}

func cleanupDirStats(root string) (uint64, uint64, uint64, error) {
	var size, files, folders uint64

	err := filepath.WalkDir(root, func(path string, entry os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}

		info, err := entry.Info()
		if err != nil {
			return err
		}

		if entry.IsDir() {
			if path != root {
				folders++
			}
			return nil
		}

		files++
		size += uint64(info.Size())
		return nil
	})
	if err != nil {
		return 0, 0, 0, err
	}

	return size, files, folders, nil
}
