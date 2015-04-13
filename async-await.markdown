# From promises to async-await

[Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) in JavaScript are a way to handle asynchronous execution in JavaScript. Since JavaScript applications are single-threaded, we must take great care to not block the thread for IO calls. Working with promises, however, has always been clunky, and [riddled with lots of gotchas](http://taoofcode.net/promise-anti-patterns/).

For example, here's a function that returns a promise that resolves to `1` 90% of the time, otherwise it rejects with an error.

```js
const oneOrError = () =>
  new Promise((resolve, reject) =>
    Math.random() < 0.9
      ? setTimeout(() => resolve(1), 0)
      : setTimeout(() => reject(new Error('failed')), 0)
  );
```

Let's call it twice, and sum up the values.

```js
oneOrError()
  .then(r1 => oneOrError().then(r2 =>  r1 + r2))
  .then(total => { console.log(total) })
  .catch(err => { console.error(err) });
```

The above is the asynchronous equivalent of:

```js
try {
  const r1 = syncOneOrError();
  const r2 = syncOneOrError();
  console.log(r1 + r2);
} catch(e) {
  console.error(e);
}
```

The promise version is a lot less readable, and the error handling is harder than in the synchronous case.

## Error handling with promises

Take this piece of synchronous code. What is the asynchronous version?

```js
try {
  try {
    syncOneOrError(); // May throw an error
    console.log('first call succeeded');
  } catch(e) {
    throw new Error('first call failed');
  }

  try {
    syncOneOrError(); // May throw an error
    console.log('second call succeeded');
  } catch(e) {
    throw new Error('second call failed');
  }

  console.log('both calls succeeded');
} catch(err) {
  console.error(err);
}

console.log('after both calls');
```

I'll let you think for a a bit.

.

.

.

Ready?

```js
oneOrError().then(() => {
  console.log('first call succeeded');
  return oneOrError().then(() => {
    console.log('second call succeeded');
  }).catch(() => {
    throw new Error('second call failed');
  });
}).catch(() => {
  throw new Error('first call failed');
}).then(() => {
  console.log('both call succeeded');
}).catch((err) => {
  console.error(err);
}).then(() => {
  console.log('after both calls');
});
```

Because the program flow does not follow the ordering of the statements, the code becomes harder to reason about. The error handler for the first call appears *after* the error handler for the second call.

This is where **async-await** comes in handy. [Async functions](https://github.com/lukehoban/ecmascript-asyncawait) are currently in the proposal stage of ES7. Some transpilers such as [Babel](https://babeljs.io/) have added support for them.

## Refactoring with ascyn-await

Let's go back to our last example. Here is the async-await version.

```js
// Wrapping in an async IEFE in order to use await.
(async function () {
  try {
    try {
      await oneOrError();
      console.log('first call succeeded');
    } catch(e) {
      throw new Error('first call failed');
    }

    try {
      await oneOrError();
      console.log('second call succeeded');
    } catch(e) {
      throw new Error('second call failed');
    }

    console.log('both calls succeeded');
  } catch(err) {
    console.error(err);
  }

  console.log('after both calls');
})();
```

The code above reads similarly to the synchronous version, with sprinkles of `async` and `await`. What happens here is that when `await` is called, the async function yields until the `oneOrError()` is resolved. When the promise is rejected, the rejected value is raised as an error. This allows error handling through try-catch blocks, rather than `.then()` and `.catch()`.

The other benefit of async-await is that computation with futures also becomes easier.

```js
try {
  const total = (await oneOrError()) + (await oneOrError()) + (await oneOrError());
  console.log(`total: ${total}`);
} catch(err) {
  console.error(err);
}
```

## Other use cases

Here are a couple other use cases for async-await.

### Returning a promise without `new Promise()`

The return type of an `async` function is a Promise. This means the following function returns a promise object.

```js
async function f() {
  return 'hello world';
}
```

We can use it with the Promise API or async-await.

```js
// Promise
f().then(msg => console.log(msg));

// async-await
(async function () {
  console.log(await f());
})();
```

### Using `await*` for parallel execution

When we need to await the results of a collection of Promises, we can use the proposed `await*`` syntax. (This is not final yet)

```js
const results = await* [oneOrError(), oneOrError(), oneOrError(), oneOrError()];
```

The above will concurrently call `oneOrError()` four times and wait for all of them to return a result, or one of them to error out.

Note that this is not the same as calling await four times.

```js
const results [
  await oneOrError(),
  await oneOrError(),
  await oneOrError(),
  await oneOrError()
]
```

Each await in the above example would yield, essentially making each `oneOrError()` call sequential.

## Further readings

- Jake Archibald has an [article](http://jakearchibald.com/2014/es7-async-functions/) written a year ago on ES7 and async-await.

- The ES7 [async function](https://github.com/lukehoban/ecmascript-asyncawait) proposal on GitHub.

- Also, check out the [async generator](https://github.com/jhusain/asyncgenerator) proposal, which adds asynchronous generator functions that return Observables.
