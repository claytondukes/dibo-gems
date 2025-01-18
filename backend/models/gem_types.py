from enum import Enum

class GemEffectType(str, Enum):
    PROC = 'proc_effect'
    STAT = 'stat_effect'
    DAMAGE = 'damage_effect'
    BUFF = 'buff_effect'
    DEBUFF = 'debuff_effect'
    SHIELD = 'shield_effect'
    SUMMON = 'summon_effect'
    UTILITY = 'utility_effect'

class GemCondition(str, Enum):
    ON_ATTACK = 'on_attack'
    ON_DASH = 'on_dash'
    ON_SKILL = 'on_skill'
    ON_DAMAGE_TAKEN = 'on_damage_taken'
    ON_KILL = 'on_kill'
    LIFE_THRESHOLD = 'life_threshold'
    COOLDOWN_RESTRICTION = 'cooldown_restriction'
    RESONANCE = 'resonance'
    COMBAT_RATING = 'combat_rating'
