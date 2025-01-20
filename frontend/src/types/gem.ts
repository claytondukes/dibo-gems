export enum GemEffectType {
  PROC = 'proc_effect',         // Triggered effects (e.g., "on attack", "on dash")
  STAT = 'stat_effect',         // Passive stat bonuses
  DAMAGE = 'damage_effect',     // Direct damage effects
  BUFF = 'buff_effect',         // Positive effects on self/allies
  DEBUFF = 'debuff_effect',     // Negative effects on enemies
  SHIELD = 'shield_effect',     // Defensive/absorb effects
  SUMMON = 'summon_effect',     // Summon temporary allies/effects
  UTILITY = 'utility_effect'    // Misc utility effects
}

export enum GemCondition {
  ON_ATTACK = 'on_attack',
  ON_DASH = 'on_dash',
  ON_SKILL = 'on_skill',
  ON_DAMAGE_TAKEN = 'on_damage_taken',
  ON_KILL = 'on_kill',
  LIFE_THRESHOLD = 'life_threshold',
  COOLDOWN_RESTRICTION = 'cooldown_restriction',
  RESONANCE = 'resonance',
  COMBAT_RATING = 'combat_rating'
}

export type GemEffect = {
  type: GemEffectType;
  description: string;
  condition: GemCondition;
  value?: number;
  duration?: number;
  cooldown?: number;
};

export type GemRank = {
  effects: GemEffect[];
};

export type GemMetadata = {
  version: string;
  last_updated: string;
};

export type Gem = {
  name: string;
  stars: 1 | 2 | 5;
  description: string;
  metadata: GemMetadata;
  ranks: Record<string, GemRank>;
};

export type GemListItem = {
  name: string;
  stars: number;
  description: string;
  effects: string[];
  file_path: string;
};

export type GemResponse = {
  gems: GemListItem[];
  total: number;
  page: number;
  per_page: number;
};
