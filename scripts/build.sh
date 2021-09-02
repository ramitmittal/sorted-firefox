#!/usr/bin/env bash

# validate version codes
node scripts/validate
validation_return_code=$?
if [ "$validation_return_code" != 0 ]; then
  exit $validation_return_code
fi

# delete previous artifacts
rm -rf dist artifacts
mkdir dist artifacts

cp -r src/manifest.json src/icons src/_locales dist

parcel build src/popup/popup.html --public-url '.' --out-dir dist/popup --no-source-maps

web-ext lint -s dist/

linterReturnCode=$?
if [ $linterReturnCode -ne 0 ]; then
  exit $retVal
fi

web-ext build -s dist/ -a artifacts/

git archive -o artifacts/$npm_package_name-$npm_package_version-source.zip HEAD
