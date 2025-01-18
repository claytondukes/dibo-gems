#!/usr/bin/env python3

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent / 'backend'
sys.path.append(str(backend_dir))

from models.gem_types import GemEffectType, GemCondition

def determine_effect_type(description: str, conditions: List[str]) -> GemEffectType:
    """Determine the effect type based on description and conditions."""
    desc_lower = description.lower()
    
    # Check conditions first
    if any(c in conditions for c in ['resonance', 'combat_rating']):
        return GemEffectType.STAT
    
    if any(c in conditions for c in ['on_attack', 'on_dash', 'on_skill', 'on_damage_taken', 'on_kill']):
        return GemEffectType.PROC

    # Check description patterns
    damage_patterns = [
        r'deal.*damage',
        r'damage.*increased',
        r'damage.*by \d+%',
        r'explosion',
        r'critical hit'
    ]
    
    buff_patterns = [
        r'increases? your',
        r'gain',
        r'grants? you',
        r'improved',
        r'attack speed',
        r'movement speed'
    ]
    
    debuff_patterns = [
        r'reduces?',
        r'decreased?',
        r'slow',
        r'weaken',
        r'take.*more damage'
    ]
    
    shield_patterns = [
        r'shield',
        r'absorb',
        r'barrier',
        r'protection',
        r'defense'
    ]
    
    summon_patterns = [
        r'summon',
        r'conjure',
        r'spawn',
        r'create',
        r'call.*forth'
    ]

    # Check patterns in order of specificity
    for pattern in damage_patterns:
        if re.search(pattern, desc_lower):
            return GemEffectType.DAMAGE
            
    for pattern in shield_patterns:
        if re.search(pattern, desc_lower):
            return GemEffectType.SHIELD
            
    for pattern in summon_patterns:
        if re.search(pattern, desc_lower):
            return GemEffectType.SUMMON
            
    for pattern in debuff_patterns:
        if re.search(pattern, desc_lower):
            return GemEffectType.DEBUFF
            
    for pattern in buff_patterns:
        if re.search(pattern, desc_lower):
            return GemEffectType.BUFF

    return GemEffectType.UTILITY

def normalize_condition(condition: str) -> Optional[GemCondition]:
    """Convert condition string to GemCondition enum."""
    condition_map = {
        'on_attack': GemCondition.ON_ATTACK,
        'on_dash': GemCondition.ON_DASH,
        'on_skill': GemCondition.ON_SKILL,
        'on_damage_taken': GemCondition.ON_DAMAGE_TAKEN,
        'on_kill': GemCondition.ON_KILL,
        'life_threshold': GemCondition.LIFE_THRESHOLD,
        'cooldown_restriction': GemCondition.COOLDOWN_RESTRICTION,
        'resonance': GemCondition.RESONANCE,
        'combat_rating': GemCondition.COMBAT_RATING
    }
    return condition_map.get(condition)

def extract_numeric_values(description: str) -> Dict[str, float]:
    """Extract numeric values from effect description."""
    values = {
        'value': None,
        'duration': None,
        'cooldown': None
    }
    
    # Extract percentage values
    pct_match = re.search(r'(\d+(?:\.\d+)?)%', description)
    if pct_match:
        values['value'] = float(pct_match.group(1))
    
    # Extract duration
    duration_match = re.search(r'for (\d+(?:\.\d+)?) seconds', description)
    if duration_match:
        values['duration'] = float(duration_match.group(1))
    
    # Extract cooldown
    cooldown_match = re.search(r'every (\d+(?:\.\d+)?) seconds', description)
    if cooldown_match:
        values['cooldown'] = float(cooldown_match.group(1))
    
    return values

def update_gem_file(file_path: Path) -> None:
    """Update a single gem file with new effect types."""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            
        modified = False
        for rank in data['ranks'].values():
            for effect in rank['effects']:
                # Always recategorize effects
                conditions = effect.get('conditions', [])
                effect_type = determine_effect_type(effect['description'], conditions)
                
                # Update effect type
                if effect['type'] != effect_type.value:
                    effect['type'] = effect_type.value
                    modified = True
                
                # Normalize conditions
                if conditions:
                    normalized = [c.value for c in map(normalize_condition, conditions) if c is not None]
                    if normalized != conditions:
                        effect['conditions'] = normalized
                        modified = True
                
                # Extract numeric values
                values = extract_numeric_values(effect['description'])
                for key, value in values.items():
                    if value is not None and effect.get(key) != value:
                        effect[key] = value
                        modified = True
        
        if modified:
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"✓ Updated {data['name']}")
        else:
            print(f"- Skipped {data['name']} (no changes needed)")
            
    except Exception as e:
        print(f"✗ Error processing {file_path.name}: {e}")

def main():
    # Get all gem files
    data_dir = Path('data')
    gem_files = []
    for star_dir in ['1star', '2star', '5star']:
        gem_files.extend(data_dir.joinpath(star_dir).glob('*.json'))
    
    print(f"Updating effect types for {len(gem_files)} gems...\n")
    for file_path in gem_files:
        update_gem_file(file_path)

if __name__ == '__main__':
    main()
