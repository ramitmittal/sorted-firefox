# Sorted
A web extension to sort bookmarks into folders based on keywords entered by the user.  
Sorted is tested to work with Mozilla Firefox. Compatibility with other browsers is planned.

### Usage
Install from [AMO](https://addons.mozilla.org/en-GB/firefox/addon/sort_bookmarks/).

### Instructions for Development
* Clone the repository.
* Compile TypeScript file
    * cd src/popup
    * tsc js/custom.ts --outDir ./
* Open about:debugging in Firefox
   * click on ```Load Temporary Addon```.
   * select any file from the ```sorted/src``` folder.
* Click on the new button appearing on the browser toolbar.

### Other Resources
* A small video screencast can be found [here](https://youtu.be/7TvW5J2sIN8).

### Meta
* Written by [Ramit Mittal](https://ramitmittal.com) - [@ramitmittal](https://github.com/ramitmittal).
* Distributed under GNU GPLv3. See **LICENSE** for more information.
* Inspired by [The Sorting Hat](https://www.pottermore.com/explore-the-story/the-sorting-hat).
* Contributions and suggestions are welcome.
* This project is under active development.
