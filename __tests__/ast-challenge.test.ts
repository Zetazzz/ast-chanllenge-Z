import generate from "@babel/generator";
import queryASTCreator from "../src";

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
