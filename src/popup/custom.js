var kai = document.getElementById("result");
kai.style.display = "none";

var rbtn = document.getElementById("randomized");
rbtn.addEventListener("click", bookFunc);

var arrayIn = [];
var MainNode;
var idOfMainNode = "";
var check0 = false;

function bookFunc(event) {

    document.getElementById("asker").style.display = "none";

    var rawIn = document.getElementById("userIn").value;
    var re = /\s*,\s*/;
    arrayIn = rawIn.split(re)
    bArray = []
    for (var item of arrayIn) { bArray.push(item.charAt(0).toUpperCase() + item.substr(1).toLowerCase()); }
    arrayIn = bArray;

    var ulist = document.createElement("ul");

    for (var value of arrayIn) {
	let letty = document.createElement("li");
	letty.className += "my-0 py-0";
	var text = document.createTextNode(value);	
	letty.appendChild(text);
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
	MainNode = result1
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

	// this is a cheap hack for the 1st run problem, ie won't call check4 for newly created folders
	// so we make it loop again from check2
	if (check0 === false) {
	check0 = true;
	checkFolders2(MainNode);	
}
	else {
    for (var sortedNode of result2) {
	  checkFolders4(sortedNode);
    }

	}

}


async function checkFolders4(result3) {
    // result3 is ChildNode of Sorted Bookmarks
	// this is the last function it does: search, compare and move

    "use strict";

    // get ID of Other Bookmarks before proceeding
    var OtherBookmarks = await browser.bookmarks.search({title: "Other Bookmarks"});

    // get all children of Other Bookmarks
    var Children = await browser.bookmarks.getChildren(OtherBookmarks[0].id);

    // compare and move
    for (var x of Children) {
	if (x.title !== "Sorted Bookmarks") {
	    var title = x.title.toLowerCase().split(/[, .]/);
	    if (title.includes(result3.title.toLowerCase())) {
		browser.bookmarks.move(x.id, {parentId: result3.id});
	    }
	}
    }
}


function onRejected(error) {
    // add a single error message to display in the popup

}

