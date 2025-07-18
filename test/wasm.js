import { InitStringModule, StringArguments } from '../src/wasm/args.js';
import { InitWasmModule } from '../src/wasm/init.js';
import { ChosenPort } from '../src/wasm/fs.js';
import { ServeFS } from '../src/wasm/fs.js';


ServeFS().then(() => {
    InitWasmModule("wasm.wasm").then(async({ module, go }) => {
        go.env.WASMFS_PORT = `${ChosenPort}`;
        go.argv = [
            "test4.txt",
            "Hello, this is a test file written from WASM!",
        ];

        console.log("WASMFS_PORT set to:", go.env.WASMFS_PORT);
        go.run(module);

        InitStringModule(module);

        console.log("WASM modules initialized successfully.");

        // let x = module.exports.SetFileData(...StringArguments("test3.txt", "Hello, this is a test file written from WASM!"));
        let x = module.exports.SetFileData();
        console.log("SetFileData result:", x);

        module.exports.writeFile();
        module.exports.readFile();

        // let y = await Promise.all([module.exports.writeFile()]);
        // console.log("Write file data:", y);

        // // x = module.exports.SetFileData(...StringArguments("test3.txt", "Hello, this is a test file written from WASM!"));
        // let z = await Promise.all([module.exports.readFile()]);
        // console.log("Read file data:", y, x, z);

        module.exports.Close();
    }).catch((err) => {
        console.error("Error initializing WASM module:", err)
        process.exit(1);
    });
})
