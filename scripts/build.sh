#!/usr/bin/env bash

# run parcel-bundler on source

rm -rf dist/
parcel build src/popup/popup.html --public-url '.' --out-dir dist/popup --no-source-maps
cp -r src/manifest.json src/icons src/_locales dist/
