import generate from "@babel/generator";
import queryASTCreator from "../src";
import methods from "../example-methods.json";

const expectCode = (ast, snapshotName?) => {
  expect(generate(ast).code).toMatchSnapshot(snapshotName);
};

it("works for methods in json", () => {
  for (const key in methods) {
    if (Object.prototype.hasOwnProperty.call(methods, key)) {
      const element = methods[key];

      let input = {};

      input[key] = element;

      expectCode(queryASTCreator(input), key);
    }
  }
});
