import {join} from "path";
import {readFile} from "fs/promises";

window.addEventListener("DOMContentLoaded", async () => {
  await injectJs()
  await injectStyles()
});


async function injectJs(): Promise<void> {
  const filename: string = join(__dirname, "injection.js")
  console.log(filename)
  const data: string = await readFile(filename, "utf8")

  let script: HTMLScriptElement = document.createElement("script")
  script.innerHTML = data
  document.body.appendChild(script)
}

async function injectStyles(): Promise<void> {
  const filename: string = join(__dirname, "../../", "styles", "style.css")
  const data: string = await readFile(filename, "utf8")

  let style: HTMLStyleElement = document.createElement("style")
  style.innerHTML = data
  document.body.appendChild(style)
}
