//go:build wasm

package wasmfs

// Copyright 2017, Joe Tsai. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE.md file.

// Package memfile implements an in-memory emulation of os.File.

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func selectedPort() string {
	if val, ok := os.LookupEnv("WASMFS_PORT"); ok {
		fmt.Println("Using WASMFS_PORT:", val)
		return val
	}

	return "51610"
}

func (fs *FileSystem) ListDir(path string) ([]ListDirItem, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("http://127.0.0.1:%s/%s", selectedPort(), path), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Accept", "wasm/directory-list")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to list directory: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to list directory: %s", resp.Status)
	}

	var items []ListDirItem
	if err := json.NewDecoder(resp.Body).Decode(&items); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return items, nil
}

func ReadFile(filename string) (*File, error) {
	resp, err := http.Get(fmt.Sprintf("http://127.0.0.1:%s/%s", selectedPort(), filename))
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get file: %s", resp.Status)
	}

	btes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	if err := resp.Body.Close(); err != nil {
		return nil, fmt.Errorf("failed to close response body: %v", err)
	}

	return New(btes, filename), nil
}

func (fb *File) WriteFile() error {
	fb.Seek(0, 0)
	resp, err := http.Post(fmt.Sprintf("http://127.0.0.1:%s/%s", selectedPort(), fb.Name()), "application/octet-stream", fb)

	if err != nil {
		return err
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to post file: %s", resp.Status)
	}

	if err := resp.Body.Close(); err != nil {
		return fmt.Errorf("failed to close response body: %v", err)
	}

	return nil
}
