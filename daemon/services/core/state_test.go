package core

import (
	"errors"
	"testing"

	"unbalance/daemon/common"
	"unbalance/daemon/domain"
)

func TestGetStateRefreshesStorageWhenNeutral(t *testing.T) {
	original := getArrayDataFn
	t.Cleanup(func() {
		getArrayDataFn = original
	})

	getArrayDataFn = func() (*domain.Unraid, error) {
		return &domain.Unraid{
			Disks: []*domain.Disk{
				{Path: "/mnt/disk1", Name: "disk1"},
				{Path: "/mnt/remotes/media", Name: "media", Remote: true},
			},
		}, nil
	}

	core := &Core{
		state: &domain.State{
			Status: common.OpNeutral,
			Unraid: &domain.Unraid{
				Disks: []*domain.Disk{{Path: "/mnt/disk1", Name: "disk1"}},
			},
		},
	}

	state := core.GetState()

	if diskByPath(state.Unraid.Disks, "/mnt/remotes/media") == nil {
		t.Fatalf("expected GetState to refresh storage and include late remote mount, got %#v", state.Unraid.Disks)
	}
}

func TestGetStateDoesNotRefreshStorageWhileBusy(t *testing.T) {
	original := getArrayDataFn
	t.Cleanup(func() {
		getArrayDataFn = original
	})

	getArrayDataFn = func() (*domain.Unraid, error) {
		return nil, errors.New("should not refresh while busy")
	}

	core := &Core{
		state: &domain.State{
			Status: common.OpScatterCopy,
			Unraid: &domain.Unraid{
				Disks: []*domain.Disk{{Path: "/mnt/disk1", Name: "disk1"}},
			},
			Operation: &domain.Operation{OpKind: common.OpScatterCopy},
		},
	}

	state := core.GetState()

	if diskByPath(state.Unraid.Disks, "/mnt/remotes/media") != nil {
		t.Fatalf("expected busy state to keep existing storage snapshot, got %#v", state.Unraid.Disks)
	}
	if state.Operation == nil {
		t.Fatal("expected busy state to keep current operation")
	}
}
