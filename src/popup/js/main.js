import '../custom.sass';

// eslint-disable-next-line no-undef
const { bookmarks } = browser;

const mainDialog = document.getElementById('main-dialog');
const mainSortLink = document.getElementById('main-sortlink');
const mainUnsortLink = document.getElementById('main-unsortlink');
const sortDialog = document.getElementById('sort-dialog');
const sortList = document.getElementById('sort-list');
const sortBack = document.getElementById('sort-back');
const sortNew = document.getElementById('sort-new');
const sortGo = document.getElementById('sort-go');
const sortInput = document.getElementById('sort-input');
const unsortDialog = document.getElementById('unsort-dialog');
const unsortAccept = document.getElementById('unsort-accept');
const unsortReject = document.getElementById('unsort-reject');
const currentSortedFolders = []; // contains full bookmarkTreeNode objects
const newSortedFolders = []; // contains only titles of bookmark folders to be created

/**
 * Empty the existing sorted folders, moving all child bookmarks out. Then delete the existing sorted folders.
 * @returns {Promise<void>}
 */
async function flattenAll() {
  const allBookmarks = await bookmarks.search({});
  const otherBookmarksId = allBookmarks[3].id;
  const existingSortedFolderIds = [];
  allBookmarks.forEach((item) => {
    if (item.title.endsWith('(sorted)') && item.type === 'folder') {
      existingSortedFolderIds.push(item.id);
    }
  });
  let allPromises = allBookmarks.map((item) => {
    if (existingSortedFolderIds.includes(item.parentId)) {
      return bookmarks.move(item.id, { parentId: otherBookmarksId });
    }
    return null;
  });
  await Promise.all(allPromises);
  allPromises = existingSortedFolderIds.map(item => bookmarks.remove(item));
  await Promise.all(allPromises);
  // currentSortedFolders.splice(0, currentSortedFolders.length);
  window.close();
}

async function go() {
  const createdSortedFolders = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const x of newSortedFolders) {
    // eslint-disable-next-line no-await-in-loop
    const newBookmarkFolder = await bookmarks.create({
      title: `${x} (sorted)`,
      type: 'folder',
    });
    createdSortedFolders.push(newBookmarkFolder);
  }
  // We will move bookmarks inside these folders
  const sortHeaders = [...createdSortedFolders, ...currentSortedFolders];

  let allBookmarks = await bookmarks.search({});
  // Do not touch the default folders
  const defaultFolders = allBookmarks.splice(0, 5);
  // Do not touch a user created folder or any bookmark inside a user created folder.
  allBookmarks = allBookmarks.filter((item) => {
    if (item.type === 'folder') return false;
    // eslint-disable-next-line no-restricted-syntax
    for (const x of defaultFolders) {
      if (item.parentId === x.id) return true;
    }
    return false;
  });
  const finalPromises = [];
  sortHeaders.forEach((header) => {
    const tags = header.title.toLowerCase().slice(0, header.title.indexOf('(sorted)')).split(',').map(s => s.trim());
    // eslint-disable-next-line no-restricted-syntax
    for (const x of allBookmarks) {
      const title = x.title.toLowerCase().split(/[, .]/).map(y => y.trim());
      // eslint-disable-next-line no-restricted-syntax
      for (const z of title) {
        if (tags.includes(z)) finalPromises.push(bookmarks.move(x.id, { parentId: header.id }));
      }
    }
  });
  await Promise.all(finalPromises);
  window.close();
}

async function getCurrentSortedFolders() {
  const results = await bookmarks.search({ query: '(sorted)' });
  currentSortedFolders.push(...results);
}

function sortListDelete(event) {
  const item = event.target.parentNode.innerText;
  const filtered = currentSortedFolders.filter(entry => entry.title === item);
  if (filtered.length > 0) {
    currentSortedFolders.splice(currentSortedFolders.indexOf(filtered[0]), 1);
  } else {
    newSortedFolders.splice(newSortedFolders.indexOf(item), 1);
  }
  sortList.removeChild(event.target.parentNode);
}

function populateSortDialog() {
  currentSortedFolders.forEach((item) => {
    const tempA = document.createElement('a');
    tempA.classList.add('dropdown-item');
    const tempSpan = document.createElement('span');
    tempSpan.classList.add('delete', 'is-small');
    tempSpan.style.marginRight = '10px';
    tempSpan.style.top = '3px';
    tempSpan.addEventListener('click', sortListDelete);
    const tempText = document.createTextNode(item.title);
    tempA.appendChild(tempSpan);
    tempA.appendChild(tempText);
    sortList.insertBefore(tempA, sortList.firstChild);
  });
}

function addNewSortItem(item) {
  const tempA = document.createElement('a');
  tempA.classList.add('dropdown-item');
  const tempSpan = document.createElement('span');
  tempSpan.classList.add('delete', 'is-small');
  tempSpan.style.marginRight = '10px';
  tempSpan.style.top = '3px';
  tempSpan.addEventListener('click', sortListDelete);
  const tempText = document.createTextNode(item);
  tempA.appendChild(tempSpan);
  tempA.appendChild(tempText);
  sortList.insertBefore(tempA, sortInput.parentElement);
}

/**
 * Handle the click of the 'new' button in sort dialog.
 */
function handleNew() {
  if (sortInput.value.trim() !== '') {
    const tagArray = sortInput.value.trim().split(',').map(item => item.toLowerCase().trim());
    const tagString = tagArray.join(', ');
    newSortedFolders.push(tagString);
    addNewSortItem(tagString);
    sortInput.value = '';
  }
}

function initListeners() {
  mainSortLink.addEventListener('click', () => {
    mainDialog.setAttribute('hidden', 'true');
    sortDialog.removeAttribute('hidden');
    getCurrentSortedFolders()
      .then(() => populateSortDialog());
  });
  sortBack.addEventListener('click', () => {
    mainDialog.removeAttribute('hidden');
    sortDialog.setAttribute('hidden', 'true');
  });
  mainUnsortLink.addEventListener('click', () => {
    mainDialog.setAttribute('hidden', 'true');
    unsortDialog.removeAttribute('hidden');
  });
  unsortAccept.addEventListener('click', () => {
    mainDialog.removeAttribute('hidden');
    unsortDialog.setAttribute('hidden', 'true');
    flattenAll();
  });
  unsortReject.addEventListener('click', () => {
    mainDialog.removeAttribute('hidden');
    unsortDialog.setAttribute('hidden', 'true');
  });
  sortNew.addEventListener('click', handleNew);
  sortGo.addEventListener('click', go);
}

window.onload = () => {
  initListeners();
};
