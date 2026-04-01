#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: bash ml/convert_to_tfjs.sh <input_model.h5> <output_dir>"
  exit 1
fi

INPUT_MODEL="$1"
OUTPUT_DIR="$2"

mkdir -p "$OUTPUT_DIR"
tensorflowjs_converter \
  --input_format=keras \
  "$INPUT_MODEL" \
  "$OUTPUT_DIR"

echo "Converted model saved to $OUTPUT_DIR"
