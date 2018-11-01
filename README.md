# Sorted
A web extension to sort bookmarks into folders based on keywords entered by the user.  
Sorted is tested to work with Mozilla Firefox. Compatibility with other browsers is planned.

### Usage
Install from [AMO](https://addons.mozilla.org/en-GB/firefox/addon/sort_bookmarks/).

### Instructions for Development
* Clone the repository.
* Make changes in src/
* Build by compiling .ts file
    * python3 build.py
* Test in Firefox
   * open about:debugging in Firefox
   * click on ```Load Temporary Addon```.
   * select any file from the ```dist/sorted``` folder.
   * click on the new button appearing on the browser toolbar.

### Other Resources
* A small video screencast can be found [here](https://youtu.be/7TvW5J2sIN8).

### Meta
* Written by [Ramit Mittal](https://ramitmittal.com) - [@ramitmittal](https://github.com/ramitmittal).
* Distributed under GNU GPLv3. See **LICENSE** for more information.
* Inspired by [The Sorting Hat](https://www.pottermore.com/explore-the-story/the-sorting-hat).
* Contributions and suggestions are welcome.
* This project is under active development.
