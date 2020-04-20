#!/usr/bin/env bash

# prepare source and distribution zip archives for upload to addons.mozilla.org

node scripts/validate
validation_return_code=$?
if [ "$validation_return_code" != 0 ]; then
  exit $validation_return_code
fi

# delete previous artifacts
rm -rf artifacts
mkdir artifacts

# bundle the extension
npm run build
web-ext build -s dist/ -a artifacts/

# create zip of source code for upload during review
find . -regextype posix-egrep -regex "./(package.json|README.md|src|scripts).*" -print0 | xargs -0 zip artifacts/sorted-$1-source.zip
