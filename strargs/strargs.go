package strargs

import (
	"fmt"
)

var buffer [10][2048]byte = [10][2048]byte{
	[2048]byte{},
	[2048]byte{},
	[2048]byte{},
	[2048]byte{},
	[2048]byte{},
	[2048]byte{},
	[2048]byte{},
	[2048]byte{},
	[2048]byte{},
	[2048]byte{},
}
var bufferIndex int = 0

//go:wasmexport MkBuffer
func MkBuffer() *byte {
	if bufferIndex >= len(buffer) {
		fmt.Println("Buffer limit reached. Please rebuild the module with a larger buffer size.")
		panic("Buffer limit reached. Please rebuild the module with a larger buffer size.")
	}

	bufferIndex++

	buffer[bufferIndex-1] = [2048]byte{}
	return &buffer[bufferIndex-1][0]
}
