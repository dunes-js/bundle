import { existsSync, readFileSync } from "fs";
import type { BundlerConfig } from "../types.js";
import { addComment } from "@babel/types";

export const fileIncluder: {
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
          path.node.callee.name === "includeFile"
        )
        {
          if (path.node.arguments.length === 0)
          {
            console.error("Include directive does not contain parameters");
            return;
          }
          if (path.node.arguments.length > 2)
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
          let withQuotes = false;
          if (path.node.arguments.length === 2)
          {
            if (path.node.arguments[1]!.type !== "BooleanLiteral")
            {
              console.error("Include directive parameter 2 is not of type boolean");
              return;
            }
            withQuotes = path.node.arguments[1].value;
          }

          path.node.arguments = [];
          addComment(path.node, "trailing", `${file_path.value}%%%${withQuotes}`);
        }
      }
    })
  },
  onConclude: (code) => {

    return code.replace(/includeFile\s*\(\)\s*\/\*[^*]+\*\//g, (str) => {

      const match = str.match(/(?<=\/\*).+(?=\*\/)/)!;

      const [path, withQuotes] = match[0]?.split("%%%") || [];

      if (!path)
      {
        throw "Could not parse " + match[0];
      }

      let content = readFileSync(path).toString();

      if (withQuotes)
      {
        content = '`' + content + '`';
      }

      return content;
    });
  }
}