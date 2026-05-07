#!/bin/bash

git clone --depth 1 https://github.com/pydantic/pydantic-ai.git /tmp/pa-clone

mkdir -p corpus

(cd /tmp/pa-clone && find docs -name "*.md") | while IFS= read -r f; do
  flat=$(echo "$f" | tr '/' '_')
  cp "/tmp/pa-clone/$f" "corpus/$flat"
done

rm -rf /tmp/pa-clone

ls corpus