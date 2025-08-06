#!/bin/bash

# ---
# Script Goal: Clean and transform the raw persons.json data into a frontend-friendly format.
# This script filters data to only include entries related to Zou Taofen (邹韬奋).
# Filtering criteria: content contains "邹韬奋", "韬奋", or "恩润"
# This script follows the Occam's Razor principle, keeping it simple with no complex dependencies.
# ---

set -e  # Exit on any error

# --- Configuration ---
# Using dirname ensures that paths are relative to the script's location
BASE_PATH="$(dirname "$0")"
INPUT_JSON_PATH="$BASE_PATH/frontend/public/data/persons.json"
OUTPUT_JSON_PATH="$BASE_PATH/frontend/public/data/persons_clean.json"

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
import re

# Configuration
input_json_path = "$INPUT_JSON_PATH"
output_json_path = "$OUTPUT_JSON_PATH"

print(f"Processing {input_json_path}")

try:
    # Read the source JSON file
    with open(input_json_path, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    # Extract the data array from the JSON structure
    if isinstance(json_data, dict) and 'data' in json_data:
        years_data = json_data['data']
    elif isinstance(json_data, list):
        years_data = json_data
    else:
        raise ValueError("Unexpected JSON structure - expected object with 'data' field")
    
    print(f"Loaded {len(years_data)} year entries")
    
    # Process each year's items
    cleaned_data = []
    
    for year_entry in years_data:
        if not isinstance(year_entry, dict) or 'items' not in year_entry:
            continue
            
        year = year_entry.get('year', '')
        items = year_entry.get('items', [])
        
        for item in items:
            if not isinstance(item, dict):
                continue
                
            # Extract ID
            item_id = item.get('id', '')
            
            # Extract date with priority: redate > redater > year
            date_value = ''
            if item.get('redate'):
                date_value = str(item['redate']).strip()
            elif item.get('redater'):
                date_value = str(item['redater']).strip()
            elif year:
                date_value = str(year)
            
            # Extract content from 'sub' field
            content = str(item.get('sub', '')).strip()
            
            # Filter: Only include items related to Zou Taofen
            # Check if content contains: 邹韬奋, 韬奋, or 恩润
            is_taofen_related = any([
                '邹韬奋' in content,
                '韬奋' in content,
                '恩润' in content
            ])
            
            # Only include items with valid id, content, and Taofen-related content
            if item_id and content and is_taofen_related:
                clean_item = {
                    'id': item_id,
                    'date': date_value,
                    'content': content
                }
                cleaned_data.append(clean_item)
    
    # Write the processed data to output file
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
    
    print(f"Processing complete. Total items processed: {len(cleaned_data)}")
    print(f"Items filtered to include only Zou Taofen related content (邹韬奋/韬奋/恩润)")
    print(f"Saved cleaned data to: {output_json_path}")

except Exception as e:
    print(f"Error: {e}")
    exit(1)

PYTHON_EOF

echo "Script completed successfully!"