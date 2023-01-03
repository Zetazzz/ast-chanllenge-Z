import babelTraverse from "@babel/traverse";
import { parse, ParserPlugin } from "@babel/parser";

// using 3 underscores around a parameter in template to prevent wrongly replacing normal identifiers.
const TEMPLATE = `
export interface ___queryInterface___<TData> extends ReactQueryParams<___responseType___, TData> {
  request?: ___requestType___;
}
const ___hookName___ = <TData = ___responseType___,>({
  request,
  options
}: ___queryInterface___<TData>) => {
  return useQuery<___responseType___, Error, TData>(["___keyName___", request], () => {
  if (!queryService) throw new Error("Query Service not initialized");
      return queryService.___queryServiceMethodName___(request);
  }, options);
};
`;

const DEFAULT_CONFIG = {
  ___queryInterface___: "UsePoolsQuery",
  ___hookName___: "usePools",
  ___requestType___: "QueryPoolsRequest",
  ___responseType___: "QueryPoolsResponse",
  ___queryServiceMethodName___: "pools",
  ___keyName___: "poolsQuery",
};

export default (
  input?: {
    [key: string]: {
      requestType: string;
      responseType: string;
    };
  },
  config?: {
    [key: string]: string;
  }
) => {
  let params = Object.assign(DEFAULT_CONFIG, config);

  // input can be null or empty, in such cases default values in config will be used.
  if (input) {
    let inputKeys = Object.keys(input);

    if (inputKeys.length) {
      let inputTypes = input[inputKeys[0]];

      params["___requestType___"] = inputTypes.requestType;
      params["___responseType___"] = inputTypes.responseType;
    }
  }

  const plugins: ParserPlugin[] = ["typescript"];

  const ast = parse(TEMPLATE, {
    sourceType: "module",
    plugins,
  });

  // replace parameters while traversal.
  babelTraverse(ast, {
    Identifier(path) {
      if (params[path.node.name]) {
        path.node.name = params[path.node.name];
      }
    },
    StringLiteral(path) {
      if (params[path.node.value]) {
        path.node.value = params[path.node.value];
      }
    },
  });

  return ast;
};
