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
  const slider = dropdown.children[1].cloneNode(true)
  if (!nodeIsElement(slider)) return
  // @ts-ignore
  slider.onclick = toggleButtonState
  slider.children[0].setAttribute("id", id)
  const label = slider.children[1]
  label.setAttribute("for", id)
  label.textContent = "Not Downloaded"
  dropdown.insertBefore(slider, h4Elements[1])
}

let DOWNLOADED_SONGS_BUTTON_STATE: boolean = false
let DOWNLOADED_SONGS_BUTTON_STATE_HELPER: boolean = false
let DOWNLOADED_SONG_HASHES: string[]

const showDownloadedSongsEvent = new Event("showDownloadedSongsEvent", {
  bubbles: true,
})
const hideDownloadedSongsEvent = new Event("hideDownloadedSongsEvent", {
  bubbles: true,
})

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
  const regex = /https:\/\/cdn\.beatsaver\.com\/([0-9a-fA-F]{40})\.zip/gm
  let songHash = regex.exec(
    element.children[2].children[0].getAttribute("href")
  )[1]

  element.addEventListener(
    "hideDownloadedSongsEvent",
    function () {
      if (DOWNLOADED_SONG_HASHES.includes(songHash))
        element.style.display = "none"
    },
    true
  )

  element.addEventListener(
    "showDownloadedSongsEvent",
    function () {
      console.log("revealing")
      element.style.display = "flex"
    },
    true
  )
}

// function setHashData(element: HTMLElement) {
//   const link = element.children[2].children[0]
//   if (!elementIsLink(link)) return
//   element.dataset.test = link.href
// }

const observer = new MutationObserver(function (mutations) {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (nodeIsElement(node) && node.className === "search-results")
        for (const element of node.children) {
          if (!nodeIsElement(element)) return
          processSearchResults(element)
          // setHashData(element)
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

function elementIsLink(element: Element): element is HTMLLinkElement {
  return element instanceof HTMLLinkElement
}

ipcRenderer.send("songHashes")
ipcRenderer.on("songHashes", (event, arg) => {
  DOWNLOADED_SONG_HASHES = arg
})
