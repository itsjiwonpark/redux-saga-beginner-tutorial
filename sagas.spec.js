import test from "tape";

import { incrementAsync } from "./saga";

test("incrementAsync Saga test", assert => {
  const gen = incrementAsync();
  console.log(gen.next().value);
  console.log(gen.next().value);
  console.log(gen.next().value);
});
