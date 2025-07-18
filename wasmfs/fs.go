//go:build !wasm

package wasmfs

// Copyright 2017, Joe Tsai. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE.md file.

// Package memfile implements an in-memory emulation of os.File.

import (
	"os"
	"path/filepath"
)

func (fs *FileSystem) ListDir(path string) ([]ListDirItem, error) {
	files, err := os.ReadDir(filepath.Join(fs.BasePath, path))
	if err != nil {
		return nil, err
	}

	result := make([]ListDirItem, 0, len(files))

	for i, file := range files {
		item := ListDirItem{
			Name: filepath.Join(path, file.Name()),
			Type: NodeTypeFile,
		}

		if file.IsDir() {
			item.Type = NodeTypeDirectory
		} else if file.Type()&os.ModeSymlink != 0 {
			item.Type = NodeTypeSymlink
		} else if !file.Type().IsRegular() {
			item.Type = NodeTypeUnknown
		}

		result[i] = item
	}
	return result, nil
}

func ReadFile(filename string) (*File, error) {
	content, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	return New(content, filename), nil
}

func (fb *File) WriteFile() error {
	fb.Seek(0, 0)

	if fb == nil {
		return os.ErrInvalid
	}

	allBytes := fb.Bytes()
	if len(allBytes) == 0 {
		return os.ErrInvalid
	}

	os.WriteFile(fb.Name(), allBytes, 0644)

	return nil
}
