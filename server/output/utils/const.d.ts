export declare const exampleEnumArray: readonly ["example1", "example2", "example3", "example4", "example5"];
export declare function getIndex<T extends readonly string[]>(arr: T, key: T[number]): number;
export declare function getEnumKey<T extends readonly string[]>(arr: T, index: number): string;
