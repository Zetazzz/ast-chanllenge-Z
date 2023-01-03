import generate from "@babel/generator";
import queryASTCreator from "../src";
import methods from "../example-methods.json";

const expectCode = (ast) => {
  expect(generate(ast).code).toMatchSnapshot();
};

it("works", () => {
  expectCode(
    queryASTCreator({
      Pools: {
        requestType: "QueryPoolsRequest",
        responseType: "QueryPoolsResponse",
      },
    })
  );
});
