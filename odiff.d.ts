interface odiffResult {
    type: "set" | "unset" | "add" | "rm";
    path: Array<string | number>;
    val: any;
    index: number;
    vals: any[];
    num: number;
}

interface odiff {
    equal(a: any, b: any): boolean;
    similar(a: any, b: any): boolean;
    applyDiffs(diff: odiffResult[], data: any): any;
}

declare function odiff(a: any, b: any): odiffResult[];

export default odiff;