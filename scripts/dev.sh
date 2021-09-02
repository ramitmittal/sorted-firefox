#!/usr/bin/env bash

rm -rf dist
mkdir dist

cp -r src/manifest.json src/icons src/_locales dist

parcel watch src/popup/popup.html --public-url '.' --out-dir dist/popup &
parcelProcess=$!

web-ext run -s dist/ &
webextProcess=$!

wait $parcelProcess $webextProcess