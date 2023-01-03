import generate from "@babel/generator";
import queryASTCreator from "../src";
import methods from "../example-methods.json";

const expectCode = (ast) => {
  expect(generate(ast).code).toMatchSnapshot();
};

// test for cases on parameters
it("works for null input", () => {
  expectCode(queryASTCreator());
});

it("works for empty input", () => {
  expectCode(queryASTCreator({}));
});

it("works for combination of customized and default configs", () => {
  expectCode(
    queryASTCreator(
      {
        Pools: {
          requestType: "QueryPoolsRequest",
          responseType: "QueryPoolsResponse",
        },
      },
      {
        ___hookName___: "testUsePools",
      }
    )
  );
});

it("works for input request and response types override the types in configs", () => {
  expectCode(
    queryASTCreator(
      {
        Pools: {
          requestType: "InputQueryPoolsRequest",
          responseType: "InputQueryPoolsResponse",
        },
      },
      {
        ___requestType___: "ConfigQueryPoolsRequest",
      }
    )
  );
});
