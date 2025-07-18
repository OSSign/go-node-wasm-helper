import * as http from 'http';
import * as fs from 'fs';

import netstat from 'node-netstat' // Credit: [Roket](https://www.npmjs.com/~roket84)

export var ChosenPort = 51600;

const netstatP = (opts) => // Credit: [vjpr](https://github.com/vjpr)
    new Promise((resolve, reject) => {
        const res = []
        netstat(
            {
                ...opts,
                done: (err) => {
                    if (err) return reject(err)
                    return resolve(res)
                }
            },
            (data) => {
                res.push(data)
            }
        )
        return res
    })

async function findFreePort({ range = [51601, 51700] }) {
    const usedPorts = (await netstatP({ filter: { protocol: 'tcp' } })).map(
        ({ local }) => local.port
    )

    let [startPort, endPort] = range
    let freePort = 0;
    for (let port = startPort; port <= endPort; port++) {
        if (!usedPorts.includes(port)) {
            freePort = port
            break
        }
    }
    return freePort
}

async function portTaken({ port }) {
    const usedPorts = (await netstatP({ filter: { protocol: 'tcp' } })).map(
        ({ local }) => local.port
    )
    return usedPorts.includes(port)
}

// GetChosenPort action
export async function GetChosenPort() {
    if (ChosenPort === null || await portTaken({ port: ChosenPort })) {
        ChosenPort = await findFreePort({ range: [51610, 51710] });
        if (ChosenPort === null) {
            throw new Error("No free port found in the range 51610-51710.");
        }
        console.log(`Chosen port: ${ChosenPort}`);
    }

    return ChosenPort;
}

function Log(message) {
    if (process.env.WASMFS_DEBUG !== 'true') {
        return;
    }
    fs.appendFile(process.stdout, `${new Date().toISOString()} - ${message}\n`, (err) => {
        if (err) {
            console.error("Failed to write to log file:", err);
        }
    });
}

// ServeFS action
export async function ServeFS() {
    if (ChosenPort === null || await portTaken({ port: ChosenPort })) {
        ChosenPort = await findFreePort({ range: [51610, 51710] });
        if (ChosenPort === null) {
            throw new Error("No free port found in the range 51610-51710.");
        }
        console.log(`Chosen port: ${ChosenPort}`);
    }
    Log(`Serving WASMFS on port ${ChosenPort}`);
    console.log(`Serving WASMFS on port ${ChosenPort}...`);
    

    http.createServer((req, res) => {
        if (!req.url || req.url.length == 0) {
            Log("Received request with empty URL");
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('400: Bad Request');
            return;
        }

        if (req.method === "GET") {
            Log(`Received GET request for ${req.url}`);
            fs.readFile(req.url.substring(1), (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(`404: File ${req?.url?.substring(1)} not found`);
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
                    res.end(data);
                }
            });
        } else if (req.method === "POST") {
            Log(`Received POST request for ${req.url}`);
            let chunks = [];

            req.on('data', (chunk) => {
                Log(`Adding chunk of size ${chunk.length}`);
                chunks.push(chunk);
            });

            req.on('end', () => {
                Log(`Received complete data for ${req.url}`);
                const url = req.url || '';
                if (!url.startsWith('/')) {
                    Log(`Invalid URL: ${url}`);
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end('400: Bad Request - URL must start with /');
                    return;
                }
                fs.writeFile(
                    url.substring(1),
                    Buffer.concat(chunks),
                    (err) => {
                        Log(`File write attempt for ${url.substring(1)} resulted in ${err ? 'error' : 'success'}`);
                        if (err) {
                            console.error(`Error writing file ${url.substring(1)}:`, err);
                            res.writeHead(500, { 'Content-Type': 'text/html' });
                            res.end(`500: Error writing file ${req?.url?.substring(1)}`);
                        } else {
                            Log(`File written successfully: ${req.url.substring(1)}`);
                            console.log("File written: ", req?.url?.substring(1));
                            res.writeHead(200, { 'Content-Type': 'text/plain' });
                            res.end('File written successfully');
                        }
                    }
                )
            })
        } else {
            Log(`Received unsupported method: ${req.method}`);
            res.writeHead(405, { 'Content-Type': 'text/html' });
            res.end('405: Method Not Allowed');
        }
    }).listen(ChosenPort);
}