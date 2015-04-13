const oneOrError = () =>
  new Promise((resolve, reject) =>
      Math.random() < 0.7
        ? setTimeout(() => resolve(1), 0)
        : setTimeout(() => reject(new Error('failed')), 0)
  );
const syncOneOrError = () => {
  if (Math.random() < 0.5) {
    return 1;
  } else {
    throw new Error('failed');
  }
};

const run = () => {
  oneOrError()
    .then(r1 => oneOrError().then(r2 =>  r1 + r2))
  .then(total => { console.log(total) })
    .catch(err => { console.error(err) });
};

const run2 = () => {
  oneOrError().then(
      r1 => oneOrError().then(r2 => console.log(r1 + r2))
    , err => console.log(err));
};

const run3 = () => {
  oneOrError().then(function success() {
    console.log('first call succeeded');
    return oneOrError().then(function success() {
      console.log('second call succeeded');
    }, function failure() {
      throw new Error('second async call failed');
    });
  }, function failure() {
    throw new Error('second async call failed');
  }).then(function () {
    console.log('both calls succeeded');
  });
};


const run4 = () => {

  try {
    try {
      syncOneOrError();
      console.log('first call succeeded');
    } catch(e) {
      throw new Error('first call failed');
    }

    try {
      syncOneOrError();
      console.log('second call succeeded');
    } catch(e) {
      throw new Error('second call failed');
    }

    console.log('Both calls succeeded');
  } catch(err) {
    console.error(err);
  }

  console.log('after calls');
};

const run5 = () => {
  async function f() {
    return 'hello world';;
  }

  f().then(msg => console.log(msg));

  (async function () {
    console.log(await f());
  })();
};

export {run5 as run};