import { readString } from "@dunes/sys";
import type { BundlerConfig } from "../types.js";
import { rollup } from "rollup";
import parser from "@babel/parser";
import { type TransformOptions } from "@babel/core";
import nodeResolve from "@rollup/plugin-node-resolve";
import virtual from "@rollup/plugin-virtual";
import { resolve } from "path";
import { Bundle } from "./Bundle.js";
import { Babs } from "./Babs.js";


export class Bundler {

  constructor(readonly config: BundlerConfig) {}

  async bundleFile(path: string, sub?: Partial<BundlerConfig>): Promise<Bundle> {
    const source = await readString(path);
    return this.bundleScript(source, path, sub);
  }
  
  async bundleScript(source: string, path = "script.ts", sub?: Partial<BundlerConfig>): Promise<Bundle> {

    const config = {
      ...this.config,
      ...sub
    }

    const parserOptions: parser.ParserOptions = {
      sourceType: "module",
      plugins: [
        "jsx", 
        "typescript", 
        "destructuringPrivate", 
        "importAttributes"
      ]
    }

    const transformOptions: TransformOptions = { presets: [] }

    if (config.jsx) {
      transformOptions.presets!.push(
        ["@babel/preset-react", config.jsx]
      );
    }

    if (config.ts !== false) {
      transformOptions.presets!.push(
        ["@babel/preset-typescript", config.ts]
      );
    }

    const babs = new Babs(
      parserOptions, 
      transformOptions
    );

    const {onParse, onLoad, onResult} = config
    const entry = resolve(path);
    const build = await rollup({
      ...(config.options || {}),
      input: "source",
      treeshake: config.treeshake,
      plugins: [
        ...(config.plug || []),
        {
          name: "parser",
          async transform(source, id) {
            const filename = id.startsWith("\0")? entry: id;
            const prepared = await onLoad?.(source, filename);
            if (prepared && prepared.text) {
              source = prepared.text;
              if (prepared.stop) return source;
            }
            const bab = babs.parse(source);
            await onParse?.(bab, filename, source);
            const code = bab.code({ filename });
            const concluded = await onResult?.(code, filename, source);
            if (concluded && concluded.text) {
              source = concluded.text;
              if (concluded.stop) return source;
            }
            return code;
          }
        },
        (nodeResolve as any as typeof nodeResolve.default)(config.resolve),
        (virtual as any as typeof virtual.default)({
          source,
          path
        })
      ],
    })

    return new Bundle(entry, build, config);
  }

}




