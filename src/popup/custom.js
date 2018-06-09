var kai = document.getElementById("result");
kai.style.display = "none";

var rbtn = document.getElementById("randomized");
rbtn.addEventListener("click", bookFunc);

var arrayIn = [];
var idOfMainNode = "";

function bookFunc(event) {

    document.getElementById("asker").style.display = "none";

    var rawIn = document.getElementById("userIn").value;
    var re = /\s*,\s*/;
    arrayIn = rawIn.split(re)
    bArray = []
    for (var item of arrayIn) { bArray.push(item.charAt(0).toUpperCase() + item.substr(1).toLowerCase()); }
    arrayIn = bArray;

    var ulist = document.createElement("ul");
    ulist.className += "list-group p-0"

    for (var value of arrayIn) {
	let letty = document.createElement("li");
	letty.className += "list-group-item my-0 py-0";
	letty.innerHTML = value;
	ulist.appendChild(letty);
    }
    
    kai.appendChild(ulist);
    kai.style.display = "block";
    

    checkFolders0();
}


function checkFolders0() {
    var promise0 = browser.bookmarks.search({title: "Sorted Bookmarks"});
    promise0.then(checkFolders1, onRejected);
}

function checkFolders1(result0) {
    if (result0.length) {
	checkFolders2(result0[0]);
    }
    else {
	var promise1 = browser.bookmarks.create({title: "Sorted Bookmarks"})
	promise1.then(checkFolders2, onRejected);
    }
}

function checkFolders2(result1) {
    idOfMainNode = result1.id;
    var promise2 = browser.bookmarks.getChildren(result1.id);
    promise2.then(checkFolders3, onRejected);
}

async function checkFolders3(result2) {
    for (var sortedNode of result2) {
	arrayIn = arrayIn.filter(title => title != sortedNode.title);
    }

    for (var newNode of arrayIn) {
	var promise3 = await browser.bookmarks.create({title: newNode, parentId: idOfMainNode});
    }
    for (var sortedNode of result2) {
	checkFolders4(sortedNode);
    }
}


async function checkFolders4(result3) {

    var OtherBookmarks = await browser.bookmarks.search({title: "Other Bookmarks"});
    console.log("other marks " + OtherBookmarks[0].id);

    var Children = await browser.bookmarks.getChildren(OtherBookmarks[0].id);
    for (var x of Children) {
	if (x.title !== "Sorted Bookmarks") {
	    var title = x.title.toLowerCase().split(" ");
	    if (title.includes(result3.title.toLowerCase())) {
		browser.bookmarks.move(x.id, {parentId: result3.id});
	    }
	}
    }
}


function onRejected(error) {
}

function logItems(bookmarkItem) {
  if (bookmarkItem.title) {
    console.log(bookmarkItem.title);
  } else {
    console.log("Folder");
  }
  if (bookmarkItem.children) {
    for (child of bookmarkItem.children) {
      logItems(child);
    }
  }
}

function logTree(bookmarkItems) {
  logItems(bookmarkItems[0]);
}
