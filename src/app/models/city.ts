interface Coordinate {
    lat: number;
    lng: number;
}

export interface CityResponse {
    cap: string;
    codice: string;
    codiceCatastale: string;
    coordinate: Coordinate;
    nome: string;
    nomeStraniero: null | string;
    prefisso: string;
    provincia: string;
}

export interface DistrictResponse {
    codice: string;
    nome: string;
    regione: string;
    sigla: string;
}

export interface City {
    name: string;
    code: string;
}