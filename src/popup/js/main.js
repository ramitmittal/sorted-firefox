import '../custom.sass';

import * as fp from 'lodash/fp';

// eslint-disable-next-line no-undef
const { bookmarks } = browser;

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

const newSortedFolders = []; // contains only titles of bookmark folders to be created
const deletedSortedFolders = []; // contains only title of bookmark folders marked for deletion

/**
 * Performs the main bookmark sort and move function
 * @returns {Promise<void>}
 */
async function go() {
  // 1.1 create new sorted folders
  const bookmarkFolderCreationPromises = newSortedFolders
    .map(item => bookmarks.create({
      title: `${item} (sorted)`,
      type: 'folder',
    }));
  await Promise.all(bookmarkFolderCreationPromises);

  // 1.2 fetch all sorted folders
  const currentSortedFolders = (await bookmarks.search({ query: '(sorted)' }))
    .filter(item => item.title.endsWith('(sorted)') && item.type === 'folder')
    .filter(item => !deletedSortedFolders.includes(item));

  // 1.3 get ids of default bookmarks folders
  const allBookmarks = await bookmarks.search({});
  const defaultFolderParentIds = fp.compose(
    fp.map(item => item.id),
    fp.take(5),
  )(allBookmarks);

  // 1.4 user created bookmark folders are not to be touched
  const candidatesForSorting = fp.compose(
    fp.filter(item => item.type !== 'folder' && defaultFolderParentIds.includes(item.parentId)),
    fp.drop(5),
  )(allBookmarks);

  // 1.5 get sortedFolderTags to aid in sorting
  const sortedFolderTags = currentSortedFolders.map((item) => {
    const tags = item.title.toLowerCase()
      .slice(0, item.title.indexOf('(sorted)'))
      .split(',')
      .map(s => s.trim());
    return [tags, item.id];
  });

  const bookmarksMovePromises = candidatesForSorting.map((item) => {
    const titleTokens = item.title
      .toLowerCase()
      .split(/[, .?!:]/)
      .map(s => s.trim());

    for (const token of titleTokens) {
      for (const sortTag of sortedFolderTags) {
        if (sortTag[0].includes(token)) return bookmarks.move(item.id, { parentId: sortTag[1] });
      }
    }
    return null;
  });
  await Promise.all(bookmarksMovePromises);
}

/**
 * Empty the existing sorted folders, moving all child bookmarks out.
 * Then delete the existing sorted folders.
 * @returns {Promise<void>}
 */
async function flattenAll() {
  const allBookmarks = await bookmarks.search({});
  const otherBookmarksId = allBookmarks[3].id;
  const existingSortedFolderIds = allBookmarks
    .filter(item => item.title.endsWith('(sorted)') && item.type === 'folder')
    .map(item => item.id);


  const bookmarkMovePromises = allBookmarks
    .filter(item => existingSortedFolderIds.includes(item.parentId))
    .map(item => bookmarks.move(item.id, { parentId: otherBookmarksId }));
  await Promise.all(bookmarkMovePromises);

  const deletedSortedFoldersPromises = existingSortedFolderIds
    .map(item => bookmarks.remove(item));
  await Promise.all(deletedSortedFoldersPromises);
}


// Helpers for managing basic UI changes
const hideElement = element => element.setAttribute('hidden', true);
const showElement = element => element.removeAttribute('hidden');
const hideMainDialog = fp.wrap(hideElement, mainDialog);
const showUnsortDialog = fp.wrap(showElement, unsortDialog);
const showSortDialog = fp.wrap(showElement, sortDialog);

/**
 * Create new element in sorted folders list.
 * @param {String} itemText - text of element
 */
function createNewSortListElement(itemText) {
  const tempA = document.createElement('a');
  tempA.classList.add('dropdown-item');
  const tempSpan = document.createElement('span');
  tempSpan.classList.add('delete', 'is-small');
  tempSpan.style.marginRight = '10px';
  tempSpan.style.top = '3px';
  tempSpan.addEventListener('click', sortListDelete);
  const tempText = document.createTextNode(itemText);
  tempA.appendChild(tempSpan);
  tempA.appendChild(tempText);
  sortList.insertBefore(tempA, sortInput.parentElement);
}


/**
 * This event listener is attached to the "X" span element of each list item.
 * @param event - HTML event
 */
function sortListDelete(event) {
  const itemTitle = event.target.parentNode.innerText;
  if (newSortedFolders.includes(itemTitle)) {
    newSortedFolders.splice(newSortedFolders.indexOf(itemTitle), 1);
  } else {
    deletedSortedFolders.push(itemTitle);
  }
  sortList.removeChild(event.target.parentNode);
}

function populateSortDialog() {
  bookmarks.search({ query: '(sorted)' })
    .then(results => results
      .map(item => createNewSortListElement(item.title)));
}

function addNewSortedFolder() {
  if (sortInput.value.trim() === '') return;

  const tagArray = sortInput.value
    .trim()
    .split(',')
    .map(item => item
      .toLowerCase()
      .trim());

  const tagString = tagArray.join(', ');

  newSortedFolders.push(tagString);
  createNewSortListElement(tagString);
  sortInput.value = '';
}


// Initialize all event listeners for the popup.
function initListeners() {
  mainSortLink.addEventListener(
    'click',
    () => {
      populateSortDialog();
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
      await go();
      window.close();
    },
  );
}

window.onload = initListeners;
