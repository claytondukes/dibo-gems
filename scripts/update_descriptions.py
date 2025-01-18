#!/usr/bin/env python3

import csv
import json
import os
import re
from pathlib import Path

def parameterize_description(desc: str) -> str:
    """Convert specific values in descriptions to parameterized versions.
    
    Examples:
    - "increases damage by 16.00%" -> "increases damage by X%"
    - "dealing 135% base damage + 547" -> "dealing X% base damage + Y"
    - "for 6 seconds" -> "for Ts"
    - "Cannot occur more often than once every 20 seconds" -> "Cannot occur more often than once every Cs"
    """
    # Replace percentage values
    desc = re.sub(r'(\d+(?:\.\d+)?)%', 'X%', desc)
    
    # Replace base damage additions
    desc = re.sub(r'(\d+(?:\.\d+)?)% base damage \+ (\d+)', 'X% base damage + Y', desc)
    
    # Replace time durations (but not cooldowns)
    desc = re.sub(r'for (\d+(?:\.\d+)?) seconds?', 'for Ts', desc)
    
    # Replace cooldown times
    desc = re.sub(r'every (\d+(?:\.\d+)?) seconds', 'every Cs', desc)
    
    # Replace specific damage values
    desc = re.sub(r'damage equal to (\d+(?:\.\d+)?)%', 'damage equal to X%', desc)
    
    # Replace specific stat values without base damage
    desc = re.sub(r'by (\d+(?:\.\d+)?)%', 'by X%', desc)
    
    return desc

def load_gem_descriptions():
    """Load gem descriptions from the CSV file."""
    descriptions = {}
    with open('docs/GemRanks.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row['Name']
            # Get the max rank description which is the most complete
            max_desc = row['Max']
            if max_desc:
                # Clean up the description
                max_desc = max_desc.strip('"')
                # Parameterize the description
                max_desc = parameterize_description(max_desc)
                descriptions[name] = max_desc
    return descriptions

def update_gem_files(descriptions):
    """Update gem JSON files with descriptions from CSV."""
    data_dir = Path('data')
    updated = []
    missing = []
    
    # Process each star rating directory
    for star_dir in ['1star', '2star', '5star']:
        star_path = data_dir / star_dir
        if not star_path.exists():
            continue
            
        # Process each gem file in the directory
        for gem_file in star_path.glob('*.json'):
            try:
                # Load the current gem data
                with open(gem_file, 'r') as f:
                    gem_data = json.load(f)
                
                # Find the matching description
                gem_name = gem_data['name']
                if gem_name in descriptions:
                    # Add or update the description
                    gem_data['description'] = descriptions[gem_name]
                    
                    # Write back the updated data
                    with open(gem_file, 'w') as f:
                        json.dump(gem_data, f, indent=2)
                    updated.append(gem_name)
                else:
                    missing.append(gem_name)
                    
            except Exception as e:
                print(f"Error processing {gem_file}: {e}")
    
    return updated, missing

def main():
    # Load descriptions from CSV
    print("Loading descriptions from CSV...")
    descriptions = load_gem_descriptions()
    
    # Update gem files
    print("\nUpdating gem files...")
    updated, missing = update_gem_files(descriptions)
    
    print("\nUpdated gems:")
    for gem in sorted(updated):
        print(f"✓ {gem}")
    
    print("\nGems missing descriptions:")
    for gem in sorted(missing):
        print(f"✗ {gem}")
    
    print("\nDone!")

if __name__ == '__main__':
    main()
