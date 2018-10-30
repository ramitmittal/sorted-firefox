var bookmarks = browser.bookmarks;

var arrayIn = [];

// The result div where keyword list will be displayed.
var result_div = document.getElementById("result");
result_div.style.display = "none";

// User clicks this button to submit keywords.
var rbtn = document.getElementById("randomized");
rbtn.addEventListener("click", bookFunc);


function bookFunc(event) {

    document.getElementById("asker").style.display = "none"; // Hide the div where keywords are entered.
    var rawIn = document.getElementById("userIn").value; // This is the string of keywords entered by the user.

    // Split the keywords into an array.
    var re = /\s*,\s*/;
    arrayIn = rawIn.split(re)
    
    // Sanitize the array elements.
    bArray = []
    for (var item of arrayIn) { bArray.push(item.charAt(0).toUpperCase() + item.substr(1).toLowerCase()); }
    arrayIn = bArray;

    // Display the keywords on which bookmarks are sorted.
    var ulist = document.createElement("ul");
    for (var value of arrayIn) {
        let letty = document.createElement("li");
        letty.className += "my-0 py-0";
        var text = document.createTextNode(value);	
        letty.appendChild(text);
        ulist.appendChild(letty);
    }
    result_div.appendChild(ulist);
    result_div.style.display = "block";
    
    // Start the actual sorting.
    sortIt();
}

async function sortIt() {
    
    var search_for_sorted = await bookmarks.search({title: "Sorted Bookmarks"});    

    var sorted_folder;
    if (search_for_sorted.length) {
        sorted_folder = search_for_sorted[0];
    }
    else {
        sorted_folder = await bookmarks.create({title: "Sorted Bookmarks"});
    }

    var nodes_in_sorted_folder = await bookmarks.getChildren(sorted_folder.id);
    
    if (nodes_in_sorted_folder.length) {
        for (var sortedNode of nodes_in_sorted_folder) {
            arrayIn = arrayIn.filter(title => title != sortedNode.title);
        }
    }

    for (var newNode of arrayIn) {
        var createdNode = await bookmarks.create({title: newNode, parentId: sorted_folder.id});
    }

    var nodes_in_sorted_folder = await bookmarks.getChildren(sorted_folder.id);
    var other_bookmarks = await bookmarks.search({title: "Other Bookmarks"});
    var other_bookmarks_children = await bookmarks.getChildren(other_bookmarks[0].id);
    
    compare_and_move(other_bookmarks_children, nodes_in_sorted_folder);

    var menu_check = document.getElementById("menu_folder_check");
    if (menu_check.checked) {
        var menu_bookmarks = await bookmarks.search({title: "Bookmarks Menu"});
        var menu_bookmarks_children = await bookmarks.getChildren(menu_bookmarks[0].id);
        compare_and_move(menu_bookmarks_children, nodes_in_sorted_folder);
    }
}

function compare_and_move(other_bookmarks_children, nodes_in_sorted_folder) {
    for (var x of other_bookmarks_children) {

        if (x.title !== "Sorted Bookmarks") {
            var split_title = x.title.toLowerCase().split(/[, .]/);

            for (var y of nodes_in_sorted_folder) {

                if (split_title.includes(y.title.toLowerCase())) {
                    bookmarks.move(x.id, {parentId: y.id});
                }
            }
        }
    }
}

function onRejected(error) {
    // add a single error message to display in the popup
}

