#!/bin/bash

echo "Préparation de Focus Blocker pour publication..."

BUILD_DIR="focus-blocker-build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "Copie des fichiers nécessaires..."

cp manifest.json "$BUILD_DIR/"
cp *.html "$BUILD_DIR/"
cp *.js "$BUILD_DIR/"
cp *.png "$BUILD_DIR/"
cp *.txt "$BUILD_DIR/" 2>/dev/null || true

echo "Fichiers copiés !"

ZIP_NAME="focus-blocker-v1.1.zip"
cd "$BUILD_DIR"
zip -r "../$ZIP_NAME" .
cd ..
