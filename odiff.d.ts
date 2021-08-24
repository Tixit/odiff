export as namespace odiff;
export = odiff;

declare function odiff(A: any, B: any, allSimilar: boolean): odiff.odiffResult[];

declare namespace odiff {
  export type odiffResult = {
    type: 'set';
    path: Array<string | number>;
    val: any;
  } | {
    type: 'unset';
    path: Array<string | number>;
  } | {
    type: 'add';
    path: Array<string | number>;
    index: number;
    vals: Array<any>;
  } | {
    type: 'rm';
    path: Array<string | number>;
    index: number;
    vals: Array<any>;
    num: number;
  }
  function equal(a: any, b: any): boolean;
  function similar(a: any, b: any, allSimilar: boolean): boolean;
}
