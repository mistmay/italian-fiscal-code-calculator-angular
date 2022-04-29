import { Component, OnInit } from '@angular/core';
import { CityApiService } from 'src/app/api/city-api.service';
import { CityResponse, DistrictResponse, City } from 'src/app/models/city';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { autoCompleteValidator } from 'src/app/validators/autocomplete-validator';
import { User, Sex } from 'src/app/models/user';

@Component({
  selector: 'app-main-form',
  templateUrl: './main-form.component.html',
  styleUrls: ['./main-form.component.scss']
})
export class MainFormComponent implements OnInit {
  cityList: City[] = [];
  options: string[] = [];
  filteredOptions!: Observable<string[]>;
  form!: FormGroup;
  fiscalCode: string = '';

  constructor(private api: CityApiService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.apiRequest();
    this.formConstruction();
    this.matAutocompleteStart();
  }

  apiRequest(): void {
    this.api.getCityList()
      .subscribe((res: CityResponse[]) => {
        this.api.getDitrictList()
          .subscribe((res2: DistrictResponse[]) => {
            res.forEach((element: CityResponse) => {
              let cityName: string = element.nome;
              const cityDistrict = res2.find((item: DistrictResponse) => item.codice === element.provincia)?.sigla;
              cityName += ` (${cityDistrict})`;
              this.cityList.push({ name: cityName, code: element.codiceCatastale });
              this.options.push(cityName);
            });
          });
      });
  }

  matAutocompleteStart(): void {
    this.filteredOptions = this.form.controls['city'].valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue)).slice(0, 10);
  }

  formConstruction(): void {
    this.form = this.formBuilder.group({
      surname: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      name: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      sex: ['', Validators.required],
      date: ['', Validators.required],
      city: ['', Validators.compose([Validators.required, autoCompleteValidator(this.options)])]
    });
  }

  getForm(): void {
    const userDetail: User = { ...this.form.value, date: this.form.controls['date'].value._d };
    let result: string = this.nameExtractor(userDetail.surname) + this.nameExtractor(userDetail.name, true) + this.dateAndSexExtractor(userDetail.date, userDetail.sex) + this.cityCodeExtractor(userDetail.city);
    const lastCharacter: string = this.lastCode(result);
    result += lastCharacter;
    this.fiscalCode = result;
  }

  nameExtractor(name: string, isName = false): string {
    const consonants: string[] = name.trim().toUpperCase().split(' ').join('').split('').filter((element: string) => element !== 'A' && element !== 'E' && element !== 'I' && element !== 'O' && element !== 'U');
    const vowels: string[] = name.trim().toUpperCase().split(' ').join('').split('').filter((element: string) => element === 'A' || element === 'E' || element === 'I' || element === 'O' || element === 'U');
    let result: string = '';
    switch (consonants.length) {
      case 0:
        switch (vowels.length) {
          case 0:
            result = 'XXX';
            break;
          case 1:
            result = vowels[0] + 'XX'
            break;
          case 2:
            result = vowels[0] + vowels[1] + 'X';
            break;
          default:
            result = vowels[0] + vowels[1] + vowels[2];
        }
        break;
      case 1:
        result = consonants[0];
        switch (vowels.length) {
          case 0:
            result += 'XX';
            break;
          case 1:
            result += vowels[0] + 'X';
            break;
          default:
            result += vowels[0] + vowels[1];
        }
        break;
      case 2:
        result = consonants[0] + consonants[1];
        switch (vowels.length) {
          case 0:
            result += 'X';
            break;
          default:
            result += vowels[0];
        }
        break;
      default:
        if (isName) {
          if (consonants.length === 3) {
            result = consonants[0] + consonants[1] + consonants[2];
          } else {
            result = consonants[0] + consonants[2] + consonants[3];
          }
        } else {
          result = consonants[0] + consonants[1] + consonants[2];
        }
    }
    return result;
  }

  dateAndSexExtractor(date: Date, sex: Sex): string {
    let result: string = String(date.getFullYear()).split('').splice(2, 2).join('');
    switch (date.getMonth()) {
      case 0:
        result += 'A';
        break;
      case 1:
        result += 'B';
        break;
      case 2:
        result += 'C';
        break;
      case 3:
        result += 'D';
        break;
      case 4:
        result += 'E';
        break;
      case 5:
        result += 'H';
        break;
      case 6:
        result += 'L';
        break;
      case 7:
        result += 'M';
        break;
      case 8:
        result += 'P';
        break;
      case 9:
        result += 'R';
        break;
      case 10:
        result += 'S';
        break;
      case 11:
        result += 'T';
        break;
    }
    let day: number = date.getDate();
    if (sex === 'female') {
      day += 40;
    }
    result += this.addZero(day);
    return result;
  }

  addZero(number: number): string {
    if (number < 10) {
      return `0${number}`;
    } else {
      return `${number}`;
    }
  }

  cityCodeExtractor(city: string): string | undefined {
    return this.cityList.find((element: City) => element.name === city)?.code;
  }

  lastCode(partialCode: string): string {
    const odds: string[] = [];
    const evens: string[] = [];
    partialCode.split('').forEach((element: string, index: number) => {
      if ((index + 1) % 2 === 0) {
        evens.push(element);
      } else {
        odds.push(element);
      }
    });
    let number: number = (this.oddsCalculator(odds) + this.evensCalculator(evens)) % 26;
    return this.lastCodeCalculator(number);
  }

  oddsCalculator(odds: string[]): number {
    let result: number = 0;
    odds.forEach((element: string) => {
      switch (element) {
        case '0':
          result += 1;
          break;
        case '1':
          result += 0;
          break;
        case '2':
          result += 5;
          break;
        case '3':
          result += 7;
          break;
        case '4':
          result += 9;
          break;
        case '5':
          result += 13;
          break;
        case '6':
          result += 15;
          break;
        case '7':
          result += 17;
          break;
        case '8':
          result += 19;
          break;
        case '9':
          result += 21;
          break;
        case 'A':
          result += 1;
          break;
        case 'B':
          result += 0;
          break;
        case 'C':
          result += 5;
          break;
        case 'D':
          result += 7;
          break;
        case 'E':
          result += 9;
          break;
        case 'F':
          result += 13;
          break;
        case 'G':
          result += 15;
          break;
        case 'H':
          result += 17;
          break;
        case 'I':
          result += 19;
          break;
        case 'J':
          result += 21;
          break;
        case 'K':
          result += 2;
          break;
        case 'L':
          result += 4;
          break;
        case 'M':
          result += 18;
          break;
        case 'N':
          result += 20;
          break;
        case 'O':
          result += 11;
          break;
        case 'P':
          result += 3;
          break;
        case 'Q':
          result += 6;
          break;
        case 'R':
          result += 8;
          break;
        case 'S':
          result += 12;
          break;
        case 'T':
          result += 14;
          break;
        case 'U':
          result += 16;
          break;
        case 'V':
          result += 10;
          break;
        case 'W':
          result += 22;
          break;
        case 'X':
          result += 25;
          break;
        case 'Y':
          result += 24;
          break;
        case 'Z':
          result += 23;
          break;
      }
    });
    return result;
  }

  evensCalculator(evens: string[]): number {
    let result: number = 0;
    evens.forEach((element: string) => {
      switch (element) {
        case '0':
          result += 0;
          break;
        case '1':
          result += 1;
          break;
        case '2':
          result += 2;
          break;
        case '3':
          result += 3;
          break;
        case '4':
          result += 4;
          break;
        case '5':
          result += 5;
          break;
        case '6':
          result += 6;
          break;
        case '7':
          result += 7;
          break;
        case '8':
          result += 8;
          break;
        case '9':
          result += 9;
          break;
        case 'A':
          result += 0;
          break;
        case 'B':
          result += 1;
          break;
        case 'C':
          result += 2;
          break;
        case 'D':
          result += 3;
          break;
        case 'E':
          result += 4;
          break;
        case 'F':
          result += 5;
          break;
        case 'G':
          result += 6;
          break;
        case 'H':
          result += 7;
          break;
        case 'I':
          result += 8;
          break;
        case 'J':
          result += 9;
          break;
        case 'K':
          result += 10;
          break;
        case 'L':
          result += 11;
          break;
        case 'M':
          result += 12;
          break;
        case 'N':
          result += 13;
          break;
        case 'O':
          result += 14;
          break;
        case 'P':
          result += 15;
          break;
        case 'Q':
          result += 16;
          break;
        case 'R':
          result += 17;
          break;
        case 'S':
          result += 18;
          break;
        case 'T':
          result += 19;
          break;
        case 'U':
          result += 20;
          break;
        case 'V':
          result += 21;
          break;
        case 'W':
          result += 22;
          break;
        case 'X':
          result += 23;
          break;
        case 'Y':
          result += 24;
          break;
        case 'Z':
          result += 25;
          break;
      }
    });
    return result;
  }

  lastCodeCalculator(number: number): string {
    let result: string = '';
    switch (number) {
      case 0:
        result = 'A';
        break;
      case 1:
        result = 'B';
        break;
      case 2:
        result = 'C';
        break;
      case 3:
        result = 'D';
        break;
      case 4:
        result = 'E';
        break;
      case 5:
        result = 'F';
        break;
      case 6:
        result = 'G';
        break;
      case 7:
        result = 'H';
        break;
      case 8:
        result = 'I';
        break;
      case 9:
        result = 'J';
        break;
      case 10:
        result = 'K';
        break;
      case 11:
        result = 'L';
        break;
      case 12:
        result = 'M';
        break;
      case 13:
        result = 'N';
        break;
      case 14:
        result = 'O';
        break;
      case 15:
        result = 'P';
        break;
      case 16:
        result = 'Q';
        break;
      case 17:
        result = 'R';
        break;
      case 18:
        result = 'S';
        break;
      case 19:
        result = 'T';
        break;
      case 20:
        result = 'U';
        break;
      case 21:
        result = 'V';
        break;
      case 22:
        result = 'W';
        break;
      case 23:
        result = 'X';
        break;
      case 24:
        result = 'Y';
        break;
      case 25:
        result = 'Z';
        break;
    }
    return result;
  }

}
