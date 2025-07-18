package main

import (
	"fmt"
	"os"
	"time"

	_ "github.com/ossign/go-node-wasm-helper/strargs"
	"github.com/ossign/go-node-wasm-helper/wasmfs"
)

var FileName string
var FileContent string

func main() {
	<-make(chan bool)
}

//go:wasmexport Close
func Close() {
	fmt.Println("Closing WASMFS...")
	// Perform any necessary cleanup here
	os.Exit(0)
}

// //go:wasmexport SetFileData
// func SetFileData(name, content string) int32 {
// 	fmt.Printf("File name set to: %s\n", name)
// 	FileName = name

// 	fmt.Printf("File content set to: %s\n", content)
// 	FileContent = content
// 	return 1
// }

//go:wasmexport SetFileData
func SetFileData() int32 {
	fmt.Println("ARGX", os.Args)

	if len(os.Args) < 2 {
		fmt.Println("Usage: SetFileData <filename> <content>")
		return 0
	}

	FileName = os.Args[0]
	FileContent = os.Args[1]

	fmt.Printf("File name set to: %s\n", FileName)
	fmt.Printf("File content set to: %s\n", FileContent)

	return 1
}

//go:wasmexport writeFile
func writeFile() int64 {
	fmt.Printf("Writing '%s' to file %s in WASMFS...\n", FileContent, FileName)

	file := wasmfs.New([]byte(FileContent), FileName)
	err := file.WriteFile()
	if err != nil {
		fmt.Println("Error writing file:", err)
	}
	fmt.Println("File written successfully!", err)

	return 123456
}

//go:wasmexport readFile
func readFile() {
	time.Sleep(10 * time.Second)
	fmt.Printf("Reading file %s from WASMFS...\n", FileName)

	file, err := wasmfs.ReadFile(FileName)
	if err != nil {
		fmt.Println("Error reading file:", err)
	}

	fmt.Printf("File content read: %s\n", string(file.Bytes()))

	if string(file.Bytes()) != FileContent {
		fmt.Println("File content does not match expected content!")
	} else {
		fmt.Println("File content matches expected content.")
	}
	fmt.Println("File read successfully!")
}
