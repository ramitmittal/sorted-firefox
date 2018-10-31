declare var browser: any

let listener;

setInterval(function() {

    browser.storage.sync.get().then((result) => {

        if (result['monitor']) {

            listener = browser.bookmarks.onCreated.addListener(() => {
        
                // call this function on bookmark add        
                console.log('bookmark added')
            })
        }
        else {
            browser.bookmarks.onCreated.removeListener(listener);
        }

    })
    

}, 6000)

