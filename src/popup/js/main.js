/* global browser */

import {
  sortedBookmarkFoldersEmitter,
  flattenAll,
  handleFolderAdd,
  handleFolderDelete,
  sortAll
} from './bookmarkUtil'

const mainDialog = document.getElementById('main-dialog')
const mainSortLink = document.getElementById('main-sort-link')
const mainUnsortLink = document.getElementById('main-unsort-link')
const sortDialog = document.getElementById('sort-dialog')
const sortList = document.getElementById('sort-list')
const sortGo = document.getElementById('sort-go')
const sortInput = document.getElementById('sort-input')
const unsortDialog = document.getElementById('unsort-dialog')
const unsortAccept = document.getElementById('unsort-accept')
const unsortReject = document.getElementById('unsort-reject')
const learnMore = document.getElementById('learn-more')
const inputHelper = document.getElementById('input-helper')
const sortDialogText = document.getElementById('sort-dialog-text')
const unsortDialogText = document.getElementById('unsort-dialog-text')
const heading = document.getElementById('heading')

/* Populate all text fields */
const { i18n } = browser
heading.innerText = i18n.getMessage('extensionName')
mainSortLink.innerText = i18n.getMessage('sortLinkText')
mainUnsortLink.innerText = i18n.getMessage('unsortLinkText')
learnMore.innerText = i18n.getMessage('learnMoreLinkText')
unsortDialogText.innerText = i18n.getMessage('unsortDialogText')
unsortAccept.innerText = i18n.getMessage('unsortAccept')
unsortReject.innerText = i18n.getMessage('unsortReject')
sortDialogText.innerText = i18n.getMessage('sortDialogText')
inputHelper.innerText = i18n.getMessage('inputHelper')
sortInput.placeholder = i18n.getMessage('sortInput')
sortGo.innerText = i18n.getMessage('sortGo')

/**
 * Event listener when user deletes element from the sorted folders list in UI.
 * @param event
 */
function sortListDelete (event) {
  handleFolderDelete(event.target.parentNode.innerText)
}

// Empty the sorted folders list in UI.
function emptySortList () {
  while (sortList.firstChild) {
    sortList.removeChild(sortList.lastChild)
  }
}

/**
 * Create new element in sorted folders list in UI.
 * @param {String} itemText - text of element
 */
function createNewSortListElement (itemText) {
  const tempSpan = document.createElement('span')
  tempSpan.classList.add('tag', 'is-dark', 'is-small')
  const tempButton = document.createElement('button')
  tempButton.classList.add('delete', 'is-small')
  tempButton.addEventListener('click', sortListDelete)
  const tempText = document.createTextNode(itemText)
  tempSpan.appendChild(tempText)
  tempSpan.appendChild(tempButton)
  sortList.appendChild(tempSpan)
}

// Listen to changes in sorted bookmark folders list and re-create list in UI
sortedBookmarkFoldersEmitter.on('update', (sbfArray) => {
  emptySortList()
  sbfArray.forEach(createNewSortListElement)
})

// Event listener when user adds element to sorted folders in UI.
function addNewSortedFolder () {
  const { value } = sortInput
  sortInput.value = ''
  if (value.trim() === '') return

  handleFolderAdd(value)
}

// Helpers for managing basic UI changes
const hideElement = element => element.setAttribute('hidden', true)
const showElement = element => element.removeAttribute('hidden')
const hideMainDialog = () => {
  hideElement(mainDialog)
}
const showUnsortDialog = () => {
  showElement(unsortDialog)
}
const showSortDialog = () => {
  showElement(sortDialog)
}

// Initialize all event listeners for the popup
function initListeners () {
  mainSortLink.addEventListener(
    'click',
    async () => {
      showSortDialog()
      hideMainDialog()
      sortInput.focus()
    }
  )
  mainUnsortLink.addEventListener(
    'click',
    () => {
      showUnsortDialog()
      hideMainDialog()
    }
  )
  unsortAccept.addEventListener(
    'click',
    async () => {
      await flattenAll()
      window.close()
    }
  )
  unsortReject.addEventListener('click', () => {
    window.close()
  })
  sortGo.addEventListener(
    'click',
    async () => {
      await sortAll()
      window.close()
    }
  )
  sortInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') addNewSortedFolder()
  })
  learnMore.addEventListener('click', async (event) => {
    // eslint-disable-next-line no-undef
    browser.tabs.create({ url: process.env.HOMEPAGE_URL })
    event.preventDefault()
  })
}

window.onload = initListeners
