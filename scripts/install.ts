import { homedir } from "node:os";

const target = process.argv[2] || `${homedir()}/.local/bin`;

await Bun.$`mkdir -p ${target}`;
await Bun.$`cp ./dist/tag ${target}/tag`;
await Bun.$`chmod +x ${target}/tag`;

console.log(`Installed tag to ${target}/tag`);
