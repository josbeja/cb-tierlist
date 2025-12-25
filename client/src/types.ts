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
    imageUrl: string;
}

export type UnitMap = Record<string, UnitData>;
