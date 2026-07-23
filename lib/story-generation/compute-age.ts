export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function computeAge(birthDate: string, asOf: Date): number {
  const birth = parseDateOnly(birthDate);
  let age = asOf.getFullYear() - birth.getFullYear();
  const hadBirthdayByAsOf =
    asOf.getMonth() > birth.getMonth() ||
    (asOf.getMonth() === birth.getMonth() && asOf.getDate() >= birth.getDate());
  if (!hadBirthdayByAsOf) {
    age -= 1;
  }
  return age;
}

/** Inverse of computeAge: the date (YYYY-MM-DD) of the birth-date's monthday in the year the person turns `age`. */
export function dateOnlyForAge(birthDate: string, age: number): string {
  const birth = parseDateOnly(birthDate);
  const year = birth.getFullYear() + age;
  const month = String(birth.getMonth() + 1).padStart(2, "0");
  const day = String(birth.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
