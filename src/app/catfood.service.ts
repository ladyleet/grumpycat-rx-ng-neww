import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CatfoodService {

  constructor(public http: HttpClient) { }

  getCatFood(food) {
    return this.http.get<{key: string, value: string}[]>(`http://localhost:5000/api/catfood?food=`+food)
  }
  
  hasCatFood(food) {
    return this.http.get<boolean>(`http://localhost:5000/api/hascatfood?food=`+food)
  }
}