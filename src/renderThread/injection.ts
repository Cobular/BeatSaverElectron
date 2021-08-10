const { ipcRenderer } = require("electron")

// global vars
let observer
let DOWNLOADED_SONGS_BUTTON_STATE: boolean
let DOWNLOADED_SONGS_BUTTON_STATE_HELPER: boolean
let DOWNLOADED_SONG_HASHES: string[]
let showDownloadedSongsEvent: Event = new Event("showDownloadedSongsEvent")
let hideDownloadedSongsEvent: Event = new Event("hideDownloadedSongsEvent")

// Redirect injection
ipcRenderer.on("navigation", (event, args) => {
  if (args === "https://beatsaver.com/") injectOurCode()
})
// First load injection
if (window.location.href === "https://beatsaver.com/") {
  // Do the injection
  console.log("injecting..")
  injectOurCode()
} else {
  console.log("not injecting")
}

// Injection Func
function injectOurCode() {
  // setup vars
  DOWNLOADED_SONGS_BUTTON_STATE = false
  DOWNLOADED_SONGS_BUTTON_STATE_HELPER = false
  DOWNLOADED_SONG_HASHES = []

  observer = new MutationObserver(mutationRecordCallback)
  observer.observe(document, {
    attributes: false,
    characterData: false,
    childList: true,
    subtree: true,
  })

  // IPC Renderers
  ipcRenderer.send("songHashes")
  ipcRenderer.on("songHashes", (event, arg) => {
    DOWNLOADED_SONG_HASHES = arg
  })

  // Inject our stuff
  injectControl("test")
}

function mutationRecordCallback(mutations: MutationRecord[]) {
  for (const mutationRecord of mutations) {
    for (const node of mutationRecord.addedNodes) {
      // Search Results
      if (nodeIsElement(node) && node.className === "search-results") {
        console.log(node)
        for (const element of node.children) {
          if (!nodeIsElement(element)) return
          processSearchResults(element)
        }
      }
    }
  }
}

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
  settingsButton.setAttribute(
    "src",
    "https://cdn.pixabay.com/photo/2018/04/23/15/35/settings-3344607_1280.png"
  )
  settingsButton.className = "settingsButton"
  settingsButton.onclick = () => ipcRenderer.send("openSettings")
  NotDownloadedButton.appendChild(settingsButton)
}

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

function processSearchResults(element: HTMLElement) {
  // Setup
  const regex = /https:\/\/cdn\.beatsaver\.com\/([0-9a-fA-F]{40})\.zip/gm
  let songHash = regex.exec(
    element.children[2].children[0].getAttribute("href")
  )[1]
  // Force load current state
  if (DOWNLOADED_SONGS_BUTTON_STATE) {
    if (DOWNLOADED_SONG_HASHES.includes(songHash))
      element.style.display = "none"
  }

  // Handle future event changes
  element.addEventListener("hideDownloadedSongsEvent", function () {
    if (DOWNLOADED_SONG_HASHES.includes(songHash))
      element.style.display = "none"
  })
  element.addEventListener("showDownloadedSongsEvent", function () {
    console.log("revealing")
    element.style.display = "flex"
  })
}

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
