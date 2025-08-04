#!/bin/bash

# ---
# Script Goal: Clean and transform the raw relationships.json data into a frontend-friendly format.
# This script extracts person nodes and relationship links, adding img and desc fields.
# Following the Occam's Razor principle, keeping it simple with no complex dependencies.
# ---

set -e  # Exit on any error

# --- Configuration ---
# Using dirname ensures that paths are relative to the script's location
BASE_PATH="$(dirname "$0")"
INPUT_JSON_PATH="$BASE_PATH/data/api_results/json/relationships.json"
OUTPUT_JSON_PATH="$BASE_PATH/frontend/public/data/relationships.json"

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
    
    # Extract the data structure
    if isinstance(json_data, dict) and 'data' in json_data:
        main_data = json_data['data'][0]  # Get the first data entry
    else:
        raise ValueError("Unexpected JSON structure - expected object with 'data' field")
    
    # Extract nodes and links
    nodes_data = main_data.get('data', [])
    links_data = main_data.get('links', [])
    
    print(f"Loaded {len(nodes_data)} person nodes and {len(links_data)} relationship links")
    
    # Process person nodes
    cleaned_persons = []
    
    for node in nodes_data:
        if not isinstance(node, dict):
            continue
            
        # Extract required fields
        person_id = node.get('id', '')
        name = node.get('name', '').strip()
        category = node.get('category', '').strip()
        pic = node.get('pic', '').strip()
        sub = node.get('sub', '').strip()
        
        # Only include nodes with valid id and name
        if person_id and name:
            # Create img field from pic field
            img = pic if pic else ''
            
            # Create desc field from sub field or use category as fallback
            desc = sub if sub else f"Category: {category}" if category else ''
            
            clean_person = {
                'id': person_id,
                'name': name,
                'category': category,
                'img': img,
                'desc': desc
            }
            cleaned_persons.append(clean_person)
    
    # Process relationship links
    cleaned_relationships = []
    
    for link in links_data:
        if not isinstance(link, dict):
            continue
            
        # Extract required fields
        source = link.get('source', '').strip()
        target = link.get('target', '').strip()
        category = link.get('category', '').strip()
        name = link.get('name', '').strip()
        
        # Only include links with valid source and target
        if source and target:
            clean_relationship = {
                'source': source,
                'target': target,
                'category': category,
                'name': name if name else category  # Use category as name if name is empty
            }
            cleaned_relationships.append(clean_relationship)
    
    # Create final output structure
    output_data = {
        'persons': cleaned_persons,
        'relationships': cleaned_relationships,
        'metadata': {
            'total_persons': len(cleaned_persons),
            'total_relationships': len(cleaned_relationships),
            'processed_at': '$(date -u +"%Y-%m-%dT%H:%M:%SZ")'
        }
    }
    
    # Write the processed data to output file
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"Processing complete.")
    print(f"Total persons processed: {len(cleaned_persons)}")
    print(f"Total relationships processed: {len(cleaned_relationships)}")
    print(f"Saved cleaned data to: {output_json_path}")

except Exception as e:
    print(f"Error: {e}")
    exit(1)

PYTHON_EOF

echo "Script completed successfully!"