declare var browser: any;
let bookmarks = browser.bookmarks;

let arrayIn: string[] = [];


window.onload = (event) => {
    // User clicks this button to submit keywords.
    let rbtn = document.getElementById("randomized");
    rbtn.addEventListener("click", bookFunc);

    initToggler();

}


function bookFunc(): void {

    document.getElementById("asker").style.display = "none"; // Hide the div where keywords are entered.
    let rawIn: string = (<HTMLTextAreaElement> document.getElementById("userIn")).value; // This is the string of keywords entered by the user.

    // Split the keywords into an array.
    let re = /\s*,\s*/;
    arrayIn = rawIn.split(re)
    
    // Sanitize the array elements.
    let bArray: string[] = []
    for (let item of arrayIn) { bArray.push(item.charAt(0).toUpperCase() + item.substr(1).toLowerCase()); }
    arrayIn = bArray;

    // Display the keywords on which bookmarks are sorted.
    let result_div = document.getElementById("result");

    if (arrayIn[0] !== "") {

        let ulist = document.createElement("ul");
        for (let value of arrayIn) {
            let letty = document.createElement("li");
            letty.className += "my-0 py-0";
            let text = document.createTextNode(value);	
            letty.appendChild(text);
            ulist.appendChild(letty);
        
        }
        result_div.appendChild(ulist);
    
    }
    else {
        let pempty = document.createElement("p");
        let text = document.createTextNode("Ahh! You entered no keywords !");
        pempty.appendChild(text);
        result_div.appendChild(pempty);
    }
    
    result_div.classList.remove('d-none');
        
    // Start the actual sorting.
    sortIt().then((result) => {

    }, 
    (error) => {

    });

}


async function sortIt(): Promise<any> {
    
    // Check if sorted bookmarks folder already exists
    let search_for_sorted: Array<any> = await bookmarks.search({title: "Sorted Bookmarks"});    

    let sortedFolder: any;
    if (search_for_sorted.length > 0) {
        sortedFolder = search_for_sorted[0];
    }
    else {
        sortedFolder = await bookmarks.create({title: "Sorted Bookmarks"});
    }

    // creating new folders from keywords
    let nodesInSortedFolder: Array<any> = await bookmarks.getChildren(sortedFolder.id);
    
    let cArray: string[] = arrayIn;
    if (nodesInSortedFolder.length > 0) {
        for (let sortedNode of nodesInSortedFolder) {
            cArray = cArray.filter(title => title != sortedNode.title);
        }
    }

    for (let newNode of cArray) {
        await bookmarks.create({title: newNode, parentId: sortedFolder.id});
    }


    nodesInSortedFolder = await bookmarks.getChildren(sortedFolder.id);
    
    let otherBookmarks: Array<any> = await bookmarks.search({title: "Other Bookmarks"});
    let otherBookmarksChildren: Array<any> = await bookmarks.getChildren(otherBookmarks[0].id);
    
    compareAndMove(otherBookmarksChildren, nodesInSortedFolder);
}


function compareAndMove(otherBookmarksChildren: Array<any>, nodesInSortedFolder: Array<any>): void {
    for (let x of otherBookmarksChildren) {

        if (x.title !== "Sorted Bookmarks") {
            let split_title = x.title.toLowerCase().split(/[, .]/);

            for (let y of nodesInSortedFolder) {

                if (split_title.includes(y.title.toLowerCase())) {
                    bookmarks.move(x.id, {parentId: y.id});

                    // what if one bookmark matches 2 titles
                }
            }
        }
    }
}


function toggleMonitor() {
    let toggler = document.getElementById("toggler");

    let setting: any;

    browser.storage.sync.get().then((result) => {

        setting = result['monitor'];
        if (setting) {

            browser.storage.sync.set({"monitor": false}).then((result => {
                toggler.innerHTML = "OFF";
                toggler.classList.remove("btn-success");
                toggler.classList.add("btn-warning");                
            }));
        
        }
        else {

            browser.storage.sync.set({"monitor": true}).then((result) => {
                toggler.innerHTML = "ON";
                toggler.classList.remove("btn-warning");
                toggler.classList.add("btn-success");
    
            });
        }

    });

}

function initToggler() {
    let toggler = document.getElementById("toggler");

    let setting: any;

    browser.storage.sync.get().then((result) => {
    
        setting = result['monitor'];
        if (setting) {
            toggler.innerHTML = "ON";
            toggler.classList.remove("btn-warning");
            toggler.classList.add("btn-success");
        }
        else {
            toggler.innerHTML = "OFF";
            toggler.classList.remove("btn-success");
            toggler.classList.add("btn-warning");

        }

        toggler.addEventListener("click", toggleMonitor);


    });

}