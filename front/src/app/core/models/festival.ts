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

export class Festival {
    constructor(
        //festival id
        public readonly id: number,
        //festival name (unique)
        public festivalName: string,
        //year of the festival
        public year: number,
        //total number of available tables (unit of measurement is table, m2 are converted to number of tables)
        public totalTables: number,
        //list of tariff zones
        public tarifZones: TarifZone[]
    ){
        if (tarifZones.length === 0) {
            throw new Error('Festival must have at least one tariff zone');
        }
        //initialize pricePerM2 if not provided
        this.tarifZones.forEach(zone => {
            if (!zone.pricePerM2) {
                zone.pricePerM2 = zone.tablePrice / 4;
            }
        });
    }

    //get the number of tariff zones
    public getNumberOfTarifZones(): number {
        return this.tarifZones.length;
    }

    //check if festival has at least one tariff zone
    public hasAtLeastOneZone(): boolean {
        return this.tarifZones.length > 0;
    }
}
