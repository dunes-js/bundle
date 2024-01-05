

import { Bundler } from "../../src/index.js"
import { fileIncluder } from "../../src/api/index.js"

const bundler = new Bundler(fileIncluder);

const bundle = await bundler.bundleScript(`

  import { extract } from "@dunes/tools";

  let Elem$1 = class Elem {}

include("test/test.tsx");

  let n = 1;

  export default (extract(n, 3));
`);

const code = await bundle.code();

console.log(code)

process.exit(0)
