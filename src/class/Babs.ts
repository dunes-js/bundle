import parser from "@babel/parser";
import { type TransformOptions } from "@babel/core";
import { Bab } from "./Bab.js";




export class Babs {
  constructor(
    public parseOptions: parser.ParserOptions,
    public transformOptions: TransformOptions
  ) {}

  parse(script: string, opts?: parser.ParserOptions): Bab {
    const ast = parser.parse(script, {
      ...this.parseOptions,
      ...opts
    });
    return new Bab(ast, this);
  }
}
