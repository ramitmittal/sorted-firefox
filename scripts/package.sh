#!/usr/bin/env bash

# prepare source and distribution zip archives for upload to addons.mozilla.org

node scripts/validate
validation_return_code=$?
if [ "$validation_return_code" != 0 ]; then
  exit $validation_return_code
fi

npm run build
rm -rf artifacts
mkdir artifacts
find . -regextype posix-egrep -regex "./(package.json|README.md|src|scripts).*" -print0 | xargs -0 zip artifacts/sorted-$1-source.zip
web-ext build -s dist/ -a artifacts/
