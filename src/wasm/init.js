import * as fs from 'node:fs';
import './exec.js';
import { readFileSync } from 'node:fs';

export var module = null;
export var go = null;

function Log(message) {
    fs.appendFile('wasmfs.log', `${new Date().toISOString()} - ${message}\n`, (err) => {
        if (err) {
            console.error("Failed to write to log file:", err);
        }
    });
}

export async function InitWasmModule(modulePath) {
    go = new global.Go();
    go.env = process.env;
    // go.exit = process.exit;
    go.stdin = process.stdin;
    go.stdout = process.stdout;
    go.stderr = process.stderr;

    Log("Initializing WASM module...");

    return WebAssembly.instantiate(readFileSync(modulePath), go.importObject).then((result) => {
        Log("WASM module initialized successfully.");
        process.on("exit", (code) => { // Node.js exits if no event handler is pending
            if (code === 0 && !go.exited) {
                Log("WASM module exited with code 0, but Go runtime is still running. Forcing exit.");
                // deadlock, make Go print error and stack traces
                go._pendingEvent = { id: 0 };
                go._resume();
            }

            // process.exit(code);
        });

        module = result.instance;

        return { module, go };
    }).catch((err) => {
        console.log(err);

        process.exit(1);
    });
}





