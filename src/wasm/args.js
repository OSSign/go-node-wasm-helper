var module = null;

export function InitStringModule(m) {
    module = m;
}

// StringArgument action
export function StringArguments(...s) {
    if (module === null) {
        throw new Error("Module not initialized. Please ensure the WASM module is loaded and activated (InitModule) before calling StringArgument.");
    }

    if (!module.exports.MkBuffer) {
        throw new Error("MkBuffer function not found in the module. Ensure the WASM module exports 'MkBuffer' on the Go side.");
    }

    const mem = module.exports.mem || module.exports.memory;
    if (!mem) {
        throw new Error("Memory not found in the module. Ensure the WASM module exports 'mem' or 'memory'.");
    }

    let output = [];

    for (const str of s) {
        if (typeof str !== 'string') {
            throw new TypeError("All arguments must be strings.");
        }

        const address = module.exports.MkBuffer();
        const memBuffer = new Int8Array(mem.buffer);
        const view = memBuffer.subarray(address, address + str.length);

        for (let i = 0; i < str.length; i++) {
            view[i] = str.charCodeAt(i);
        }

        output.push(address, str.length);
    }

    return output;
}