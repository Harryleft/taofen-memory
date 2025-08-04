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

# 3. 选择可用的 Python 解释器
if command -v python &>/dev/null; then
    PYTHON_CMD="python"
elif command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
else
    echo "Error: Python interpreter not found!" >&2
    exit 1
fi

echo "Processing data using $PYTHON_CMD ..."

$PYTHON_CMD << PYTHON_EOF
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
    
    # Create a set of valid person IDs for validation
    valid_person_ids = {str(person['id']) for person in cleaned_persons}
    print(f"Valid person IDs: {sorted(list(valid_person_ids))[:10]}...")  # Show first 10 IDs
    
    # Process relationship links
    cleaned_relationships = []
    invalid_count = 0
    
    for link in links_data:
        if not isinstance(link, dict):
            continue
            
        # Extract required fields
        source = str(link.get('source', '')).strip()
        target = str(link.get('target', '')).strip()
        category = link.get('category', '').strip()
        name = link.get('name', '').strip()
        
        # Only include links with valid source/target that存在并且 source 不能为 "0"
        if (source and target and 
            source != "0" and
            source in valid_person_ids and 
            target in valid_person_ids and
            source != target):  # Avoid self-references
            
            clean_relationship = {
                'source': source,
                'target': target,
                'category': category,
                'name': name if name else category  # Use category as name if name is empty
            }
            cleaned_relationships.append(clean_relationship)
        else:
            invalid_count += 1
            if invalid_count <= 5:  # Show first 5 invalid relationships
                print(f"Invalid relationship: source={source}, target={target}, source_valid={source in valid_person_ids}, target_valid={target in valid_person_ids}")
    
    print(f"Filtered relationships: {len(cleaned_relationships)} valid out of {len(links_data)} total ({invalid_count} invalid)")
    
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