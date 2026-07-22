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
