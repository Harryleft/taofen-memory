#!/bin/bash

# ---
# Script Goal: Clean and transform the raw books.json data into a frontend-friendly format.
# This script follows the Occam's Razor principle, keeping it simple with no complex dependencies.
# ---

set -e  # Exit on any error

# --- Configuration ---
# Using dirname ensures that paths are relative to the script's location
BASE_PATH="$(dirname "$0")"
INPUT_JSON_PATH="$BASE_PATH/data/api_results/json/books.json"
IMAGE_SEARCH_PATH="$BASE_PATH/data/api_results/images/books"
OUTPUT_JSON_PATH="$BASE_PATH/frontend/public/data/books_clean.json"

# --- Main Logic ---

# 1. Check if input file exists
echo "Reading source file: $INPUT_JSON_PATH"
if [[ ! -f "$INPUT_JSON_PATH" ]]; then
    echo "Error: Input file '$INPUT_JSON_PATH' does not exist!" >&2
    exit 1
fi

# 2. Ensure the output directory exists
OUTPUT_DIR="$(dirname "$OUTPUT_JSON_PATH")"
if [[ ! -d "$OUTPUT_DIR" ]]; then
    echo "Output directory does not exist. Creating: $OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
fi

# 3. Process the JSON data using pure Python (no external dependencies)
echo "Processing data..."

python3 << PYTHON_EOF
import json
import os
import glob
import re

# Configuration
base_path = "$BASE_PATH"
input_json_path = "$INPUT_JSON_PATH"
image_search_path = "$IMAGE_SEARCH_PATH"
output_json_path = "$OUTPUT_JSON_PATH"

print(f"Processing {input_json_path}")

try:
    # Read the source JSON file
    with open(input_json_path, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    # Extract the books array from the data field
    if isinstance(json_data, dict) and 'data' in json_data:
        books = json_data['data']
    elif isinstance(json_data, list):
        books = json_data
    else:
        raise ValueError("Unexpected JSON structure")
    
    print(f"Loaded {len(books)} records")
    
    # Process each book
    cleaned_data = []
    
    for book in books:
        # Extract the year with priority: redate > redater > yearno
        year_value = ''
        
        # Check redate first
        if book.get('redate') and re.search(r'[12]\d{3}', str(book['redate'])):
            match = re.search(r'[12]\d{3}', str(book['redate']))
            year_value = int(match.group(0))
        # Check redater second
        elif book.get('redater') and re.search(r'[12]\d{3}', str(book['redater'])):
            match = re.search(r'[12]\d{3}', str(book['redater']))
            year_value = int(match.group(0))
        # Check yearno third
        elif book.get('yearno') and re.search(r'[12]\d{3}', str(book['yearno'])):
            match = re.search(r'[12]\d{3}', str(book['yearno']))
            year_value = int(match.group(0))
        
        # Find the local image file
        image_path = ''
        book_id = book.get('ID', '')
        if book_id:
            pattern = os.path.join(image_search_path, f'book_{book_id}_*.*')
            matching_files = glob.glob(pattern)
            
            if matching_files:
                # Use the first matching file
                image_file = os.path.basename(matching_files[0])
                image_path = f'/images/books/{image_file}'
        
        # Build the clean object
        clean_book = {
            'id': book.get('ID', ''),
            'year': year_value,
            'bookname': str(book.get('bookname', '')).strip(),
            'writer': str(book.get('writer', '')).strip(),
            'publisher': str(book.get('orgname', '')).strip(),
            'image': image_path
        }
        
        cleaned_data.append(clean_book)
    
    # Write the processed data to output file
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
    
    print(f"Processing complete. Total records processed: {len(books)}. Records generated: {len(cleaned_data)}")
    print(f"Saved cleaned data to: {output_json_path}")

except Exception as e:
    print(f"Error: {e}")
    exit(1)

PYTHON_EOF