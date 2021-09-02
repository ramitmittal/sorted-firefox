/* global browser */

import * as fp from 'lodash/fp'
import EventEmitter from 'events'

const { bookmarks } = browser

let otherBookmarksId // the Id of the "Other Bookmarks" folder

/**
 * Bookmark objects of Sorted folders already existing in the browser bookmarks
 * @type {BookmarkTreeNode[]}
 */
let existingSortedBookmarkFolders = []

/**
 * Bookmark objects of Sorted folders that user created in this session
 * Do not exist in the browser bookmarks yet
 * @type {BookmarkTreeNode[]}
 */
let newSortedFolders = []

/**
 * For emitting events on deletion/addition of sorted folders
 * (was previous a) rxjs subject
 * @see publishToSubscriber
 */
const sortedBookmarkFoldersEmitter = new EventEmitter()

/** Publish sorted folder changes for UI re-render */
function publishToSubscriber () {
  /**
   * map the bookmark folders (existing and newly added) to their titles
   * which are used to render UI
   */
  const dataForUI = [...existingSortedBookmarkFolders, ...newSortedFolders]
    .map(item => item.title.split(' (sorted)')[0])

  // publish the changes
  sortedBookmarkFoldersEmitter.emit('update', dataForUI)
}

/**
 * Empty an existing sorted bookmarks folder, moving all child bookmarks to "Other Bookmarks".
 * Then delete the folder itself.
 * @returns {Promise<void>}
 */
async function flattenOneBookmarkFolder (parentBookmark) {
  const children = await bookmarks.getChildren(parentBookmark.id)
  const bookmarkMovePromises = children
    .map(childBookmark => bookmarks.move(childBookmark.id, { parentId: otherBookmarksId }))
  await Promise.all(bookmarkMovePromises)
  return bookmarks.removeTree(parentBookmark.id)
}

/**
 * Flatten all existing sorted bookmark folders.
 * @see flattenOneBookmarkFolder
 */
async function flattenAll () {
  const promises = existingSortedBookmarkFolders.map(flattenOneBookmarkFolder)
  return Promise.all(promises)
}

/**
 * Performs the main bookmark sort and move function
 * @returns {Promise<void>}
 */
async function sortAll () {
  // 1.1 create new sorted folders
  const bookmarkFolderCreationPromises = newSortedFolders
    .map(item => bookmarks.create({
      title: item.title,
      type: 'folder'
    }))
  const createdSortedFolders = await Promise.all(bookmarkFolderCreationPromises)

  // 1.2 add created folders to existingSortedFolders
  const newSortedFoldersWithIds = fp.zip(newSortedFolders, createdSortedFolders)
    // this zip operation helps us retain the "sortedKeywords" property that we previously computed
    .map(zippedArr => ({
      ...zippedArr[1],
      sortedKeywords: zippedArr[0].sortedKeywords
    }))

  newSortedFolders = []
  existingSortedBookmarkFolders = [...existingSortedBookmarkFolders, ...newSortedFoldersWithIds]

  /**
   * 1.3
   * Fetch all bookmarks and find bookmarks that are to be checked.
   * Only bookmarks that are un-organized are to be moved.
   * Direct children of default folders like "Bookmarks Menu" etc. will be checked.
   * Any bookmark in a user-created folder will be not moved.
   */
  const allBookmarks = await bookmarks.search({})

  // Get ids of default bookmarks folders like "Bookmarks Menu" etc.
  const defaultFolderParentIds = fp.compose(
    fp.map(item => item.id),
    fp.take(5)
  )(allBookmarks)
  const candidatesForSorting = fp.compose(
    fp.filter(item => item.type !== 'folder' && defaultFolderParentIds.includes(item.parentId)),
    fp.drop(5)
  )(allBookmarks)

  // 1.4 compare and move
  const bookmarksMovePromises = candidatesForSorting.map((item) => {
    // Split the title of a bookmark into array of individual words
    const titleWords = item.title
      .toLowerCase()
      .split(/[, .?!:]/)
      .map(s => s.trim())

    // eslint-disable-next-line no-restricted-syntax
    for (const word of titleWords) {
      // eslint-disable-next-line no-restricted-syntax
      for (const esbf of existingSortedBookmarkFolders) {
        if (esbf.sortedKeywords.includes(word)) {
          return bookmarks.move(item.id, { parentId: esbf.id })
        }
      }
    }
    return null
  })
  await Promise.all(bookmarksMovePromises)
}

/**
 * Update internal application state when the user deletes a folder from the popup UI.
 * @param {String} itemTitle.
 */
function handleFolderDelete (itemTitle) {
  const deletedFolderTitle = `${itemTitle} (sorted)`

  /**
   * A folder being deleted will be in "newSortedFolders"
   *    if user added the keyword in the same session
   * In this case, just remove the folder from program state
   */
  const indexInNewSortedFolders = fp.findIndex(fp.matchesProperty('title', deletedFolderTitle), newSortedFolders)

  if (indexInNewSortedFolders !== -1) {
    newSortedFolders.splice(indexInNewSortedFolders, 1)
    return
  }

  /**
   * A folder being deleted will be in "existingSortedBookmarksFolders"
   *    if it was created in some previous session
   * In this case, remove the folder from program state and also delete the actual bookmarks folder
   *    from the browser
   */
  const indexInExistingFolders = fp.findIndex(fp.matchesProperty('title', deletedFolderTitle), existingSortedBookmarkFolders)
  if (indexInExistingFolders !== -1) {
    const deletedFolder = existingSortedBookmarkFolders
      .splice(indexInExistingFolders, 1)
    flattenOneBookmarkFolder(deletedFolder[0])
  }

  // publish changes for UI re-render
  publishToSubscriber()
}

/**
 * Update internal application state when the user adds a folder in the popup UI.
 * @param {String} rawInput
 */
function handleFolderAdd (rawInput) {
  // split the input into keywords and trim spaces
  const keywordArray = rawInput
    .split(',')
    .map(item => item
      .toLowerCase()
      .trim())

  // ensure that keywords are unique
  const uniqueKeywordArray = fp.uniq(keywordArray)

  // validate that same keyword does not appear in some pre-existing folder
  const allTheFolders = [...existingSortedBookmarkFolders, ...newSortedFolders]
  const allTheTags = fp.flatMap('sortedKeywords', allTheFolders)

  const validTagsFromInput = uniqueKeywordArray.filter(item => !allTheTags.includes(item))
  if (validTagsFromInput.length === 0) return

  // add folder to program state, this folder will be created in browser bookmarks later
  const newSortedFolder = { title: `${validTagsFromInput.join(', ')} (sorted)`, sortedKeywords: validTagsFromInput }
  newSortedFolders.push(newSortedFolder)

  // publish changes for UI re-render
  publishToSubscriber()
}

/** Fetch bookmark data from browser and save in program state to reduce repetitive queries */
(async function initState () {
  const allBookmarks = await bookmarks.search({})

  otherBookmarksId = allBookmarks[3].id

  existingSortedBookmarkFolders = allBookmarks
    .filter(item => item.title.endsWith('(sorted)') && item.type === 'folder')
    .map(item => ({ ...item, sortedKeywords: item.title.split(' (sorted)')[0].split(', ') }))

  publishToSubscriber()
}())

export {
  flattenAll, sortAll, sortedBookmarkFoldersEmitter, handleFolderDelete, handleFolderAdd
}
