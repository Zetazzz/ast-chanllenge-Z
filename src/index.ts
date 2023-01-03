import babelTraverse from "@babel/traverse";
import { parse, ParseResult, ParserPlugin } from "@babel/parser";
import { File, Identifier } from "@babel/types";

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

/**
 * Function of creating an AST based on input types and configs.
 * @param {Object=} input - input request and response types. input can be null or empty, in such cases the function will use values in config.
 * @param {Object=} config - config for customizing parts in returned AST.
 * @param {string} [config.___queryInterface___=UsePoolsQuery] - query interface
 * @param {string} [config.___hookName___=usePools] - hook name
 * @param {string} [config.___requestType___=QueryPoolsRequest] - request type
 * @param {string} [config.___responseType___=QueryPoolsResponse] - response type
 * @param {string} [config.___queryServiceMethodName___=pools] - queryService method name
 * @param {string} [config.___keyName___=poolsQuery] - key name
 * @returns {ParseResult} created AST
 */
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
): ParseResult<File> => {
  let params = Object.assign({}, DEFAULT_CONFIG, config);

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
    VariableDeclarator(path) {
      let id = path.node.id as Identifier;

      if (id) {
        if (params[id.name]) {
          id.name = params[id.name];
        }
      }
    },
    TSTypeReference(path) {
      let id = path.node.typeName as Identifier;

      if (id) {
        if (params[id.name]) {
          id.name = params[id.name];
        }
      }
    },
    TSInterfaceDeclaration(path) {
      if (params[path.node.id.name]) {
        path.node.id.name = params[path.node.id.name];
      }
    },
    MemberExpression(path) {
      let id = path.node.property as Identifier;

      if (id) {
        if (params[id.name]) {
          id.name = params[id.name];
        }
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
