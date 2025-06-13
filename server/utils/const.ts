export const exampleEnumArray = [
  "example1",
  "example2",
  "example3",
  "example4",
  "example5",
] as const;

export function getIndex<T extends readonly string[]>(arr: T, key: T[number]) {
  return arr.findIndex((item) => item === key);
}

export function getEnumKey<T extends readonly string[]>(arr: T, index: number) {
  return arr[index];
}


