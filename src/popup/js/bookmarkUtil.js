// eslint-disable-next-line no-undef
import * as fp from 'lodash/fp';

// eslint-disable-next-line no-undef
const { bookmarks } = browser;

/**
 * Contains only titles of bookmark folders to be created
 * @type {string[]}
 */
const newSortedFolders = [];

/**
 * Contains only title of bookmark folders marked for deletion
 * @type {string[]}
 */
const deletedSortedFolders = [];

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

/**
 * Performs the main bookmark sort and move function
 * @returns {Promise<void>}
 */
async function sortAll() {
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
    .filter((item) => {
      const { title } = item;
      const titleWithoutSorted = title.substr(0, title.indexOf(' (sorted)'));
      if (deletedSortedFolders.includes(title)
        || deletedSortedFolders.includes(titleWithoutSorted)) {
        return false;
      }
      return true;
    });

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

    // eslint-disable-next-line no-restricted-syntax
    for (const token of titleTokens) {
      // eslint-disable-next-line no-restricted-syntax
      for (const sortTag of sortedFolderTags) {
        if (sortTag[0].includes(token)) return bookmarks.move(item.id, { parentId: sortTag[1] });
      }
    }
    return null;
  });
  await Promise.all(bookmarksMovePromises);
}

/**
 * Wrapper for the bookmarks search query.
 * @returns {Promise<Array<Object>>>}
 */
function fetchExistingFolders() {
  return bookmarks.search({ query: '(sorted)' });
}

/**
 * Update internal application state when the user deletes a folder from the popup UI.
 * @param {String} itemTitle - this will either be a string that ends with ' (sorted)' or not.
 */
function handleFolderDelete(itemTitle) {
  if (newSortedFolders.includes(itemTitle)) {
    newSortedFolders.splice(newSortedFolders.indexOf(itemTitle), 1);
  } else {
    deletedSortedFolders.push(itemTitle);
  }
}

/**
 * Update internal application state when the user adds a folder in the popup UI.
 * @param {String} itemTitle
 */
function handleFolderAdd(itemTitle) {
  newSortedFolders.push(itemTitle);
}

export {
  flattenAll, sortAll, fetchExistingFolders, handleFolderDelete, handleFolderAdd,
};
