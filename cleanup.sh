#!/bin/bash

# Get the directory of the script
directory="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Remove .mp3 files in the audio subdirectory with 'converted' in filename
find "$directory/audio" -type f -name "*converted*.mp3" -delete

# Enter the hls subdirectory and remove all files except README.md
cd "$directory/audio/hls"
shopt -s extglob
rm -v !("README.md")
