export type Sex = 'male' | 'female';

export interface User {
    surname: string;
    name: string;
    sex: Sex;
    date: Date
    city: string;
}