import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function autoCompleteValidator(options: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (options.find((element: string) => element === value)) {
            return null;
        } else {
            return { isNotOption: true };
        }
    }
}