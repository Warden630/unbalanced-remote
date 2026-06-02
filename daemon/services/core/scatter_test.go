package core

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/cskr/pubsub"

	"unbalance/daemon/common"
	"unbalance/daemon/domain"
)

func TestScatterCopyFromRemoteSourceIncludesEverySelectedDirectory(t *testing.T) {
	source := "/mnt/remotes/media"
	target := "/mnt/disk1"

	plan := domain.Plan{
		ChosenFolders:   []string{"first", "second"},
		BytesToTransfer: 2,
		VDisks: map[string]*domain.VDisk{
			source: {
				Path: source,
				Src:  true,
			},
			target: {
				Path: target,
				Dst:  true,
				Bin: &domain.Bin{
					Size: 2,
					Items: []*domain.Item{
						{Name: "/mnt/remotes/media/first", Size: 1, Path: "first", Location: source},
						{Name: "/mnt/remotes/media/second", Size: 1, Path: "second", Location: source},
					},
				},
			},
		},
	}

	core := &Core{
		ctx: &domain.Context{
			Config: domain.Config{
				NotifyPlan:     0,
				NotifyTransfer: 0,
			},
		},
		state: &domain.State{
			Status: common.OpScatterCopy,
			Unraid: &domain.Unraid{
				Disks: []*domain.Disk{
					{Path: source, Name: "media", Remote: true},
					{Path: target, Name: "disk1"},
				},
			},
		},
	}

	operation := core.createScatterOperation(plan)

	if len(operation.Commands) != 2 {
		t.Fatalf("expected one copy command per selected directory, got %d", len(operation.Commands))
	}

	entries := map[string]bool{}
	for _, command := range operation.Commands {
		entries[command.Entry] = true
	}

	for _, entry := range []string{"first", "second"} {
		if !entries[entry] {
			t.Fatalf("expected command entry %q, got %#v", entry, entries)
		}
	}
}

func TestRemoteSelectedDirectoriesRemainTopLevelPlanItems(t *testing.T) {
	root := t.TempDir()
	source := filepath.Join(root, "remote")

	mustWriteFile(t, filepath.Join(source, "first", "movie.mkv"), "first")
	mustWriteFile(t, filepath.Join(source, "second", "show.mkv"), "second")

	core := &Core{
		ctx: &domain.Context{
			Hub: pubsub.New(100),
		},
	}
	disk := &domain.Disk{Path: source, Name: "remote", Remote: true}

	items, _, _, _, _ := core.getItemsAndIssues(
		common.OpScatterPlan,
		0,
		reItems,
		reStat,
		[]*domain.Disk{disk},
		[]string{"first", "second"},
	)

	paths := map[string]bool{}
	for _, item := range items {
		paths[item.Path] = true
	}

	for _, path := range []string{"first", "second"} {
		if !paths[path] {
			t.Fatalf("expected remote selected directory %q to remain a plan item, got %#v", path, paths)
		}
	}
}

func mustWriteFile(t *testing.T, path string, contents string) {
	t.Helper()

	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("create parent for %s: %v", path, err)
	}

	if err := os.WriteFile(path, []byte(contents), 0o644); err != nil {
		t.Fatalf("write %s: %v", path, err)
	}
}
