import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CityResponse, DistrictResponse } from '../models/city';

@Injectable({
  providedIn: 'root'
})
export class CityApiService {

  constructor(private http: HttpClient) { }

  getCityList() {
    return this.http.get<CityResponse[]>('https://comuni-ita.herokuapp.com/api/comuni');
  }

  getDitrictList() {
    return this.http.get<DistrictResponse[]>('https://comuni-ita.herokuapp.com/api/province');
  }
}
