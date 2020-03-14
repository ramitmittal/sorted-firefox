# Sorted
A web extension to organize bookmarks into folders based on user specified tags/keywords.  
Sorted is tested for Mozilla Firefox and Google Chrome.  

*Sorted is an extension that makes organizing bookmarks easier. It is designed to fit inside the existing bookmarks model and stay out of the user's way.  
Sorted has zero configuration and zero background processing. It will only work when the user clicks on the extension's icon.*

### Usage
###### Firefox
Install from [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/sorted/).
###### Chrome
Sorted is not available on Chrome Web Store. See the instructions below to set it up manually.

### Instructions for Development
* Clone the repository.
* Make sure you checkout the `master` branch.
* Install and Build
    * `npm install`
    * `npm run build`
* Test in Firefox
    * open `about:debugging` in Firefox
    * click on `Load Temporary Addon`.
    * select the `manifest.json` file from the `dist/` folder.
    * click on the Sorted icon appearing on the browser toolbar.
 * Test in Chrome
    * open `chrome://extensions` in Chrome.
    * enable developer mode
    * click on the `Load Unpacked` button.
    * select the folder `dist/` folder.
    * click on the Sorted icon appearing on the browser toolbar.


### Other Resources
* A small video screencast (for v2.1) can be found [here](https://youtu.be/7TvW5J2sIN8).

### Meta
* Distributed under GNU GPLv3. See **LICENSE** for more information.
* Inspired by [The Sorting Hat](https://www.pottermore.com/explore-the-story/the-sorting-hat).
* The icon for Sorted is provided by [icons8](https://icons8.com).
* Contributions and suggestions are welcome. Please consider opening an issue or submitting a pull request.
* Author: Ramit Mittal - [email](mailto:commitemailoframit@protonmail.com) - [website](https://ramitmittal.tech)
