import {join} from "path";
import {readFile} from "fs/promises";

window.addEventListener("DOMContentLoaded", async () => {
  await inject()
});


async function inject(): Promise<void> {
  const filename: string = join(__dirname, "injection.js")
  const data: string = await readFile(filename, "utf8")

  let script: HTMLScriptElement = document.createElement("script")
  script.innerHTML = data
  document.body.appendChild(script)
}
