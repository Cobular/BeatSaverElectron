const { ipcRenderer } = require("electron")

function getDropdown(): Element {
  return document.getElementsByClassName("form-group col-sm-3 text-center")[0]
    .children[1]
}

function injectControl(id: string) {
  const dropdown: Element = getDropdown()
  const h4Elements = Array.from(dropdown.children).filter((element) => {
    return element.tagName.toLowerCase() === "h4"
  })
  const NotDownloadedButton = dropdown.children[1].cloneNode(true)
  if (!nodeIsElement(NotDownloadedButton)) return
  NotDownloadedButton.classList.add("not-downloaded-buttons")

  const label = NotDownloadedButton.children[1]
  if (!elementIsLabel(label)) return
  label.setAttribute("for", id)
  label.textContent = "Not Downloaded"
  label.onclick = toggleButtonState
  dropdown.insertBefore(NotDownloadedButton, h4Elements[1])

  const toggleButton = NotDownloadedButton.children[0]
  // @ts-ignore
  toggleButton.onclick = toggleButtonState
  // @ts-ignore
  toggleButton.setAttribute("id", id)

  let settingsButton = document.createElement("input")
  settingsButton.setAttribute("type", "image")
  // TODO: probably should download and re-host this
  settingsButton.setAttribute("src","https://cdn.pixabay.com/photo/2018/04/23/15/35/settings-3344607_1280.png")
  settingsButton.className = "settingsButton"
  NotDownloadedButton.appendChild(settingsButton)
  NotDownloadedButton.onclick = () => ipcRenderer.send("openSettings")
}

let DOWNLOADED_SONGS_BUTTON_STATE: boolean = false
let DOWNLOADED_SONGS_BUTTON_STATE_HELPER: boolean = false
let DOWNLOADED_SONG_HASHES: string[]

const showDownloadedSongsEvent = new Event("showDownloadedSongsEvent")
const hideDownloadedSongsEvent = new Event("hideDownloadedSongsEvent")

function toggleButtonState() {
  if (DOWNLOADED_SONGS_BUTTON_STATE_HELPER) {
    // State Bullshit
    DOWNLOADED_SONGS_BUTTON_STATE = !DOWNLOADED_SONGS_BUTTON_STATE
    DOWNLOADED_SONGS_BUTTON_STATE_HELPER = false
    // Event Firing
    if (DOWNLOADED_SONGS_BUTTON_STATE)
      Array.from(document.getElementsByClassName("beatmap")).forEach((value) =>
        value.dispatchEvent(hideDownloadedSongsEvent)
      )
    else
      Array.from(document.getElementsByClassName("beatmap")).forEach((value) =>
        value.dispatchEvent(showDownloadedSongsEvent)
      )
  } else DOWNLOADED_SONGS_BUTTON_STATE_HELPER = true
}


/// Handle clicking on the gear icon
function openSettings() {
  ipcRenderer.send("")
}

function processSearchResults(element: HTMLElement) {
  const regex = /https:\/\/cdn\.beatsaver\.com\/([0-9a-fA-F]{40})\.zip/gm
  let songHash = regex.exec(
    element.children[2].children[0].getAttribute("href")
  )[1]

  element.addEventListener(
    "hideDownloadedSongsEvent",
    function () {
      if (DOWNLOADED_SONG_HASHES.includes(songHash))
        element.style.display = "none"
    })

  element.addEventListener(
    "showDownloadedSongsEvent",
    function () {
      console.log("revealing")
      element.style.display = "flex"
    })
}

const observer = new MutationObserver(function (mutations) {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (nodeIsElement(node) && node.className === "search-results")
        for (const element of node.children) {
          if (!nodeIsElement(element)) return
          processSearchResults(element)
        }
    }
  }
})

const observerParent = document.getElementById("root")
observer.observe(observerParent, {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
})
injectControl("test")

// Guards
function nodeIsElement(node: Node): node is HTMLElement {
  return node instanceof HTMLElement
}

function elementIs<T extends Element>(element: Element, type: T): element is T {
  // @ts-ignore
  return element instanceof type
}

function elementIsLabel(element: Element): element is HTMLLabelElement {
  // @ts-ignore
  return element instanceof HTMLLabelElement
}


// IPC Renderers
ipcRenderer.send("songHashes")
ipcRenderer.on("songHashes", (event, arg) => {
  DOWNLOADED_SONG_HASHES = arg
})

