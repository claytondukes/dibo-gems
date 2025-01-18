# Gem Structure Documentation

## Overview

Gems are powerful items that provide various effects to enhance gameplay. Each gem is defined in a JSON file with a specific structure that determines its behavior and effects.

## File Structure

Each gem file follows this basic structure:

```json
{
  "metadata": {
    "version": "1.0",
    "last_updated": "YYYY-MM-DDTHH:MM:SS-05:00"
  },
  "name": "Gem Name",
  "stars": "1-5",
  "ranks": {
    "1": {
      "effects": [
        {
          "type": "effect_type",
          "description": "Effect description",
          "conditions": [],
          "value": 0.0
        }
      ]
    }
  },
  "description": "Overall gem description with placeholders"
}
```

## Star Ratings

Gems are categorized by star ratings:

- 1-star: Basic gems
- 2-star: Enhanced gems
- 5-star: Legendary gems

## Effect Types

Gems can have multiple effects, each with its own type. Here are all the available effect types:

### Available Effect Types

- `proc_effect`: Triggered effects that occur in response to specific actions
  - Example: "On attack, has a X% chance to..."
  - Example: "When dashing, you have a X% chance to..."

- `stat_effect`: Passive stat bonuses that are always active
  - Example: "Increases your combat rating by X"
  - Example: "Gain X% increased movement speed"

- `damage_effect`: Effects that deal damage to enemies
  - Example: "Deal X% weapon damage to enemies"
  - Example: "Inflict X damage over Y seconds"

- `buff_effect`: Positive effects that enhance you or your allies
  - Example: "Gain X% increased attack speed"
  - Example: "Nearby allies gain Y% increased damage"

- `debuff_effect`: Negative effects applied to enemies
  - Example: "Enemies take X% increased damage"
  - Example: "Slow enemies by X% for Y seconds"

- `shield_effect`: Defensive and damage absorption effects
  - Example: "Create a shield that absorbs X damage"
  - Example: "Gain X% damage reduction for Y seconds"

- `summon_effect`: Effects that summon temporary allies or entities
  - Example: "Summon a shadow clone for X seconds"
  - Example: "Create Y mirror images that each deal X% damage"

- `utility_effect`: Miscellaneous utility and quality of life effects
  - Example: "Increase gold find by X%"
  - Example: "Reduce cooldowns by X%"

### Common Effect Properties

Each effect has these common properties:

- `type`: The type of effect (from list above)
- `description`: Detailed description of what the effect does
- `conditions`: Array of conditions that must be met for the effect to trigger
- `value`: Numerical value associated with the effect (percentage, flat value, etc.)
- `duration`: (Optional) How long the effect lasts in seconds

### Effect Conditions

Common conditions include:

- `cooldown_restriction`: Effect can only trigger after cooldown expires
- `health_threshold`: Effect triggers based on health percentage
- `combat_state`: Effect requires specific combat conditions
- `skill_type`: Effect triggers from specific skill types

## Rank System

Gems can be ranked up from 1 to 10, with each rank providing:

- Improved effect values
- Enhanced capabilities
- Additional effects at certain ranks

## Variables in Descriptions

Gem descriptions use placeholder variables:

- `X%`: Percentage values that scale with rank
- `Y`: Flat values that scale with rank
- `Ts`: Time in seconds
- `Cs`: Cooldown in seconds

## Best Practices

When creating or modifying gems:

1. Maintain consistent JSON structure
2. Use appropriate effect types
3. Include clear descriptions
4. Document all conditions
5. Follow the established naming conventions
6. Keep effects balanced within their star rating
