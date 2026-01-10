import fs from "fs";
import { fontSplit } from "cn-font-split";
const inputBuffer = new Uint8Array(fs.readFileSync("./DingTalk JinBuTi.ttf").buffer);
console.time("node");
await fontSplit({
  input: inputBuffer,
  outDir: "./dist/font"
});
console.timeEnd("node");
