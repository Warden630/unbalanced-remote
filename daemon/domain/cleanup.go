package domain

type CleanupSetup struct {
	Source string   `json:"source"`
	Items  []string `json:"items"`
}

type CleanupItem struct {
	Path    string `json:"path"`
	Full    string `json:"full"`
	Disk    string `json:"disk"`
	Name    string `json:"name"`
	Dir     bool   `json:"dir"`
	Files   uint64 `json:"files"`
	Folders uint64 `json:"folders"`
	Size    uint64 `json:"size"`
}

type CleanupPlan struct {
	Source       string        `json:"source"`
	Items        []CleanupItem `json:"items"`
	TotalFiles   uint64        `json:"totalFiles"`
	TotalFolders uint64        `json:"totalFolders"`
	TotalSize    uint64        `json:"totalSize"`
}
