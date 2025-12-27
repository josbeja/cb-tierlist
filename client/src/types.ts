export interface Tier {
    id: string;
    name: string;
    description: string;
    units: string[];
}

export type TierList = Tier[];

export interface TierListResponse {
    lastUpdated: string;
    tiers: TierList;
}

export interface UnitData {
    id: number;
    unit_name: string;
    imageUrl: string;
    leadership: number;
    era: number;
    era_desc: string;
    tier: number;
    tier_desc: string;
    type: string;
    season: string;
}

export type UnitMap = Record<string, UnitData>;
