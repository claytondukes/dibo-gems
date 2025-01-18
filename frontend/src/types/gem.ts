export type GemEffect = {
  type: string;
  description: string;
  conditions?: string[];
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
