#!/usr/bin/env python3

import json
from pathlib import Path
import re

def parameterize_value(value: str) -> str:
    """Convert specific values to parameters."""
    # Replace numeric values with variables
    value = re.sub(r'(\d+(?:\.\d+)?)%', 'X%', value)
    value = re.sub(r'(\d+(?:\.\d+)?) seconds', 'Ts', value)
    value = re.sub(r'every (\d+(?:\.\d+)?) seconds', 'every Cs', value)
    value = re.sub(r'by (\d+(?:\.\d+)?)', 'by X', value)
    value = re.sub(r'\+(\d+(?:\.\d+)?)', '+Y', value)
    return value

def get_max_rank_effects(gem_data: dict) -> list:
    """Get effects from the highest rank."""
    ranks = gem_data.get('ranks', {})
    max_rank = max(int(r) for r in ranks.keys())
    return ranks[str(max_rank)]['effects']

def generate_description(gem_data: dict) -> str:
    """Generate a standardized description from the gem's effects."""
    effects = get_max_rank_effects(gem_data)
    descriptions = []
    
    for effect in effects:
        desc = effect['description']
        conditions = effect.get('conditions', [])
        
        # Skip combat rating and resonance effects as they're not part of main description
        if any(c in ['combat_rating', 'resonance'] for c in conditions):
            continue
            
        # Parameterize the description
        desc = parameterize_value(desc)
        descriptions.append(desc)
    
    # Join all effects with proper punctuation
    if len(descriptions) == 1:
        return descriptions[0]
    elif len(descriptions) == 2:
        return f"{descriptions[0]} and {descriptions[1]}"
    else:
        return ", ".join(descriptions[:-1]) + f", and {descriptions[-1]}"

def update_gem_file(file_path: Path) -> None:
    """Update a single gem file with a generated description."""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            
        # Generate description if one doesn't exist
        if 'description' not in data:
            description = generate_description(data)
            data['description'] = description
            
            # Write back the updated data
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"✓ {data['name']}: {description}")
        else:
            print(f"! {data['name']}: Already has description")
            
    except Exception as e:
        print(f"✗ Error processing {file_path.name}: {e}")

def main():
    missing_files = [
        "data/1star/entropic_well.json",
        "data/1star/havoc_bearer.json",
        "data/1star/hearthstone.json",
        "data/1star/los_focused_gaze.json",
        "data/1star/misery_elixir.json",
        "data/2star/cold_confidant.json",
        "data/2star/exigent_echo.json",
        "data/2star/eye_of_the_unyielding.json",
        "data/2star/grim_rhythm.json",
        "data/2star/igneous_scorn.json",
        "data/2star/ironbane.json",
        "data/2star/lucent_watcher.json",
        "data/2star/mercys_harvest.json",
        "data/2star/mossthorn.json",
        "data/2star/mothers_lament.json",
        "data/2star/mourneskull.json",
        "data/2star/pain_clasp.json",
        "data/2star/unrefined_passage.json",
        "data/2star/vipers_bite.json",
        "data/5star/gloom_cask.json",
        "data/5star/golden_firmament.json",
        "data/5star/hilt_of_many_realms.json",
        "data/5star/maw_of_the_deep.json",
        "data/5star/roiling_consequence.json",
        "data/5star/spiteful_blood.json",
        "data/5star/starfire_shard.json",
        "data/5star/stormvault.json",
        "data/5star/tear_of_the_comet.json",
        "data/5star/void_spark.json",
        "data/5star/wulfheort.json"
    ]
    
    print("Generating descriptions for missing gems...\n")
    for file_path in missing_files:
        update_gem_file(Path(file_path))

if __name__ == '__main__':
    main()
