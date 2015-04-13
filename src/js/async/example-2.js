const f = async() => 'hello';
const g = async() => 'world';

const run3 = async() => {
  console.log([await f(), await g()]);
};

const run = async() => {
  const futureF = f();
  const futureG = g();
  const results = [await futureF, await futureG];
  console.log(results);
};

const run2 = async() => {
  const results = await* [f(), g()];
  console.log(results);
};

export {run, run2, run3};