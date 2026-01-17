export interface ZoneTarifaire {
    id: number;
    festivalId: number;
    nom: string;
    prixTable: number;
    prixM2: number;
}

export interface ZonePlan {
    id: number;
    festivalId: number;
    nom: string;
    zoneTarifaireId: number;
    zoneTarifaire?: ZoneTarifaire;
}

export interface Festival {
    id: number;
    nom: string;
    lieu: string;
    dateDebut: string;
    dateFin: string;
    nbTotalTable: number;
    nbTotalChaise: number;
    bigTables?: number;
    bigChairs?: number;
    smallTables?: number;
    smallChairs?: number;
    mairieTables?: number;
    mairieChairs?: number;
    zoneTarifaires?: ZoneTarifaire[];
    zonesT?: ZoneTarifaire[];
    zonePlans?: ZonePlan[];
}

export interface TarifZone {
    id: number;
    //name of the tariff zone
    name: string;
    //total number of tables in this zone
    totalTables: number;
    //number of remaining free tables (following reservations)
    remainingTables: number;
    //price of the table in this tariff zone
    tablePrice: number;
    //price per m2 in this tariff zone (default: tablePrice / 4)
    pricePerM2?: number;
}
