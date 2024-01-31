import parser from "@babel/parser";
import { transformFromAstSync, type TransformOptions, traverse } from "@babel/core";
import type { File } from "@babel/types";
import type { Babs } from "./Babs.js";




export class Bab {
  constructor(
    public ast: parser.ParseResult<File>,
    public babs: Babs
  ) {}

  code(options: TransformOptions): string {
    const r = transformFromAstSync(this.ast, undefined, {
      ...this.babs.transformOptions,
      ...options,
    });
    return r?.code || "";
  }

  traverse(options: import("@babel/traverse").TraverseOptions) {
    traverse(this.ast, options);
  }
}
