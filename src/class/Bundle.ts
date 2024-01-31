import { writeStr } from "@dunes/sys";
import type { BundlerConfig } from "../types.js";
import { type RollupBuild } from "rollup";




export class Bundle {
  #build: RollupBuild;
  #config: BundlerConfig;

  constructor(readonly entry: string, build: RollupBuild, config: BundlerConfig) {
    this.#build = build;
    this.#config = config;
  }

  get watchFiles() {
    return this.#build.watchFiles;
  }

  async code(): Promise<string> {
    const { output } = await this.#build.generate(
      this.#config.output || {}
    );
    let code = "";
    for (const chunk of output) {
      if (chunk.type === "chunk") {
        code += chunk.code + "\n";
      }
    }
    const finish = await this.#config.onConclude?.(code, this.entry);
    return finish || code;
  }

  async write(to: string): Promise<void> {
    await writeStr(to, await this.code());
  }

  async evaluate(): Promise<unknown> {
    return eval(await this.code());
  }
}
