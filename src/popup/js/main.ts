declare var browser: any;
let bookmarks = browser.bookmarks;


async function findSortedFolder(): Promise<number | null> {
    let results: Array<any> = await bookmarks.search({title: "Sorted Bookmarks"});    

    if (results.length > 0) {
        return results[0].id;
    }
    return null;
}

async function createSortedFolder(): Promise<number> {

    let sortedFolder = await bookmarks.create({title: "Sorted Bookmarks"});
    return sortedFolder.id;
}

async function findSortedSubFolders(sortedFolderId: number): Promise<Array<any> | null> {

    let results: Array<any> = await bookmarks.getChildren(sortedFolderId);
    
    if (results.length > 0) {
        return results;
    }
    return null;

}


function initText(keys: Array<any>): void {

    let titles: Array<string> = [];
    for  (let x of keys) {
        titles.push(x.title);
    }

    let keyws: string = titles.join(", ");
    let userIn = <HTMLTextAreaElement> document.getElementById("userIn");
    userIn.value = keyws;
}

function onUserInput(): Array<string> | null {

    document.getElementById("asker").style.display = "none"; // Hide the div where keywords are entered.
    let rawIn: string = (<HTMLTextAreaElement> document.getElementById("userIn")).value; // This is the string of keywords entered by the user.

    // Split the keywords into an array.
    let re = /\s*,\s*/;
    let arrayIn: Array<string> = rawIn.split(re)
    
    // Sanitize the array elements.
    let bArray: string[] = []
    for (let item of arrayIn) { bArray.push(item.charAt(0).toUpperCase() + item.substr(1).toLowerCase()); }

    if (bArray[0] !== "") {
        return bArray;
    }
    else {
        return null;
    }
}


async function createNewFolders(oldFolders: Array<any>, bArray: Array<string>, sortedFolder: number): Promise<void> {

    let cArray: Array<string> = bArray;
    if (oldFolders !== null) {
        
        for (let sortedNode of oldFolders) {
            cArray = cArray.filter(title => title != sortedNode.title);
        }
    }
    for (let newNode of cArray) {
        await bookmarks.create({title: newNode, parentId: sortedFolder});
    }

}


async function compareAndMove(bArray: Array<string>, sortedSubFolders: Array<any>, sortedFolder: number): Promise<void> {

    // find all bookmarks in Other Bookmarks
    let otherBookmarks: Array<any> = await bookmarks.search({title: "Other Bookmarks"});
    let otherBookmarksChildren: Array<any> = await bookmarks.getChildren(otherBookmarks[0].id);

    // filter sortedSubFolders with bArray
    let filteredFolders: Array<any> = sortedSubFolders.filter((item) => {

        for (let x of bArray) {
            if (x === item.title) {
                return true;
            }
        }
        return false;

    });
    
    for (let x of otherBookmarksChildren) {

        if (x.title !== "Sorted Bookmarks") {
            let split_title = x.title.toLowerCase().split(/[, .]/);

            for (let y of filteredFolders) {

                if (split_title.includes(y.title.toLowerCase())) {
                    bookmarks.move(x.id, {parentId: y.id});

                    // what if one bookmark matches 2 titles
                }
            }
        }
    }

    return
}

function showResult(bArray: Array<string> | null): void {

    let result_div = document.getElementById("result");

    if (bArray === null) {

        let letty = document.createElement("p");
        let text = document.createTextNode("No values entered.");
        letty.appendChild(text);
        result_div.appendChild(letty);

    }
    else {

        let ulist = document.createElement("ul");
        for (let value of bArray) {
            let letty = document.createElement("li");
            letty.className += "my-0 py-0";
            let text = document.createTextNode(value);	
            letty.appendChild(text);
            ulist.appendChild(letty);
        }
        result_div.appendChild(ulist);
    }

    result_div.classList.remove("d-none");  


}

let sortedFolder: number | null;
let sortedSubFolders: Array<any> | null;
let bArray: Array<string>;

async function main0() {

    // find sorted folder
        // if no , move ahead
        // if yes, find sorted subfolder, save those, init text

    sortedFolder = await findSortedFolder();
    
    if (sortedFolder === null) {
        sortedFolder = await createSortedFolder();
    }
    sortedSubFolders = await findSortedSubFolders(sortedFolder);

    if (sortedSubFolders !== null) {
        initText(sortedSubFolders);
    }

    // User clicks this button to submit keywords.
    let rbtn = document.getElementById("randomized");
    rbtn.addEventListener("click", main1);

}


async function main1() {

    // on user input, return sanitized input array
    bArray = onUserInput();

    if (bArray === null) {
        showResult(bArray);
    }

    else {

        // check if new folders need to be created
        await createNewFolders(sortedSubFolders, bArray, sortedFolder);

        // update sortedSubFolders
        sortedSubFolders = await findSortedSubFolders(sortedFolder);

        // compare and move
        await compareAndMove(bArray, sortedSubFolders, sortedFolder);

        // show result
        showResult(bArray);
    }

}

main0();
