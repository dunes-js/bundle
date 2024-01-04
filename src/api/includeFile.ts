import { existsSync, readFileSync } from "fs";
import type { BundlerConfig } from "../types.js";
import { addComment } from "@babel/types";

export const includer: {
  onParse: BundlerConfig["onParse"]
  onConclude: BundlerConfig["onConclude"]

} = {
  onParse: (bab, _) => 
  {
    bab.traverse({
      CallExpression(path)
      {
        if (
          path.node.callee.type === "Identifier" &&
          path.node.callee.name === "include"
        )
        {
          if (path.node.arguments.length === 0)
          {
            console.error("Include directive does not contain parameters");
            return;
          }
          if (path.node.arguments.length > 1)
          {
            console.error("Include directive contains too many parameters");
            return;
          }
          if (path.node.arguments[0]!.type !== "StringLiteral")
          {
            console.error("Include directive parameter is not of type string");
            return;
          }

          const file_path = path.node.arguments[0];
          if (!existsSync(file_path.value))
          {
            console.error("Could not find file", file_path.value);
            return;
          }

          path.node.arguments = [];
          addComment(path.node, "trailing", file_path.value);
        }
      }
    })
  },
  onConclude: (code) => {

    return code.replace(/include\(\) .+/, (str) => {

      const path = str.match(/(?<=\/\*).+(?=\*\/)/)!;

      return readFileSync(path[0]!).toString();
    });
  }
}

export function include<T>(_path: string): T
{
  return {} as T;
};