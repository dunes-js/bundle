
import type { BundlerConfig } from "../types.js";
import { stringLiteral } from "@babel/types";

export const stringIncluder: BundlerConfig["onParse"] = (bab, babs) => 
{
  bab.traverse({
    CallExpression(path)
    {
      if (
        path.node.callee.type === "Identifier" &&
        path.node.callee.name === "includeString"
      )
      {
        if (path.node.arguments.length === 0)
        {
          console.error("Include directive does not contain parameters");
          return;
        }
        if (path.node.arguments.length > 3)
        {
          console.error("Include directive contains too many parameters");
          return;
        }
        if (path.node.arguments[0]!.type !== "StringLiteral")
        {
          console.error("Include directive parameter is not of type string");
          return;
        }

        const {value} = path.node.arguments[0];
        let useParse = false;

        if (path.node.arguments.length === 2)
        {
          if (path.node.arguments[1]!.type !== "BooleanLiteral")
          {
            console.error("Include directive parameter 2 is not of type boolean");
            return;
          }
          useParse = path.node.arguments[1].value;
        }

        path.replaceWith(stringLiteral(
          useParse
          ? babs.parse(value).code({})
          : value
        ));
      }
    }
  })
}