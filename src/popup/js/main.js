import '../custom.sass';

import { Subject } from 'rxjs';
import {
  fetchExistingFolders,
  flattenAll,
  handleFolderAdd,
  handleFolderDelete,
  sortAll,
} from './bookmarkUtil';

const mainDialog = document.getElementById('main-dialog');
const mainSortLink = document.getElementById('main-sortlink');
const mainUnsortLink = document.getElementById('main-unsortlink');
const sortDialog = document.getElementById('sort-dialog');
const sortList = document.getElementById('sort-list');
const sortNew = document.getElementById('sort-new');
const sortGo = document.getElementById('sort-go');
const sortInput = document.getElementById('sort-input');
const unsortDialog = document.getElementById('unsort-dialog');
const unsortAccept = document.getElementById('unsort-accept');
const unsortReject = document.getElementById('unsort-reject');

/** dispatch changes in sorted folders list to bookmarks util for syncing internal state */
const folderDeleteSubject = new Subject();
folderDeleteSubject.subscribe(handleFolderDelete);

const folderAddSubject = new Subject();
folderAddSubject.subscribe(handleFolderAdd);

/**
 * Event listener for removing element from the sorted folder list.
 * @param event
 */
function sortListDelete(event) {
  sortList.removeChild(event.target.parentNode);
  folderDeleteSubject.next(event.target.parentNode.innerText);
}

/**
 * Create new element in sorted folders list.
 * @param {String} itemText - text of element
 */
function createNewSortListElement(itemText) {
  const tempSpan = document.createElement('span');
  tempSpan.classList.add('tag', 'is-dark', 'is-small');
  const tempButton = document.createElement('button');
  tempButton.classList.add('delete', 'is-small');
  tempButton.addEventListener('click', sortListDelete);
  const tempText = document.createTextNode(itemText);
  tempSpan.appendChild(tempText);
  tempSpan.appendChild(tempButton);
  sortList.appendChild(tempSpan);
}

// Event listener for adding element to sorted folder list.
function addNewSortedFolder() {
  const { value } = sortInput;
  sortInput.value = '';
  if (value.trim() === '') return;

  const tagString = value
    .trim()
    .split(',')
    .map(item => item
      .toLowerCase()
      .trim())
    .join(', ');

  createNewSortListElement(tagString);
  folderAddSubject.next(tagString);
}

// Helpers for managing basic UI changes
const hideElement = element => element.setAttribute('hidden', true);
const showElement = element => element.removeAttribute('hidden');
const hideMainDialog = () => { hideElement(mainDialog); };
const showUnsortDialog = () => { showElement(unsortDialog); };
const showSortDialog = () => { showElement(sortDialog); };

// Initialize all event listeners for the popup
function initListeners() {
  mainSortLink.addEventListener(
    'click',
    async () => {
      // populate the list on sort dialog and show
      const survivingSortedFolders = await fetchExistingFolders();
      survivingSortedFolders.map(item => createNewSortListElement(item.title));
      showSortDialog();
      hideMainDialog();
    },
  );
  mainUnsortLink.addEventListener(
    'click',
    () => {
      showUnsortDialog();
      hideMainDialog();
    },
  );
  unsortAccept.addEventListener(
    'click',
    async () => {
      await flattenAll();
      window.close();
    },
  );
  unsortReject.addEventListener('click', () => {
    window.close();
  });
  sortNew.addEventListener('click', addNewSortedFolder);
  sortGo.addEventListener(
    'click',
    async () => {
      await sortAll();
      window.close();
    },
  );
  sortInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') addNewSortedFolder();
  });
}

window.onload = initListeners;
