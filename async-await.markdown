# From promises to async-await

[Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) in JavaScript are a way to handle asynchronous execution in JavaScript. Since JavaScript applications are single-threaded, we must take great care to not block the thread for IO calls.

Working with promises, however, has always been clunky, and [riddled with gotchas](http://taoofcode.net/promise-anti-patterns/).

This this post we'll explore [Async Functions](https://github.com/lukehoban/ecmascript-asyncawait) (currently in proposal for ES7), and how they can make working with promises easier.

## In the beginning...

Let's start by looking at some synchronous code. Say we have a function that has a 90% chance of returns a 1, otherwise throws an error.

```
function oneOrErrorSync() {
  if (Math.random() < 0.9) {
    return 1;
  } else {
    throw new  Error('failed');
  }
}
```

We can call this function as follows.

```
let total = oneOrErrorSync() + oneOrErrorSync();
console.log(`The totals is ${total}.`);
```

Pretty straight-forward. We're calling the function twice and adding the values together.

Of course, error handling is not present yet.

## On to async!

Here's an async version of the `oneOrErrorSync` function.

```
function oneOrErrorAsync() {
  return new Promise((resolve, reject) => {
    if (Math.random() < 0.9) {
      setTimeout(() => resolve(1), 0);
    } else {
      setTimeout(() => reject(new Error('failed')), 0);
    }
  });
}
```

Again, let's call it twice, and sum up the values.

```
oneOrErrorAsync()
  .then(r1 => oneOrErrorAsync().then(r2 =>  r1 + r2))
  .then(total => { console.log(`The total is ${total}.`) })
```

Here, we're waiting for the first promise to resolve, then making the second call. Finally, when the second result comes back, we return the total. The second `.then()` resolves with the total.

Now, let's compare error handling of sync vs async.

## Synchronous error handling

Let's start with the following synchronous code.

```
let total = 0;

try {
  total += oneOrErrorSync();
} catch(e) {
  throw new Error('First call errored.');
}

try {
  total += oneOrErrorSync();
} catch(e) {
  throw new Error('Second call errored.');
}

console.log('After both calls...');
console.log(`The total is ${total}.`);
```

Now, let's compare the previous code to the async version.

```
let total = 0;

oneOrError().then((value) => {
  total += value;
  return oneOrError().then((value) => {
    total += value;
  }).catch(() => {
    throw new Error('Second call errored.');
  });
}).catch(() => {
  throw new Error('First call errored.');
}).then(() => {
  console.log('After both calls...');
  console.log(`The total is ${total}.`);
});
```

I'd argue that the code is hard to follow because the program flow does not match the ordering of the statements. The error handler for the first call appears *after* the error handler for the second call.

This is where **async-await** comes in.

## Refactoring with async-await

Let's rewrite the previous async example using async-await.

```
// Wrapping in an async IEFE in order to use await.
(async function () {
  let total = 0;
  
  try {
    total += await oneOrErrorAsync();
  } catch(e) {
    throw new Error('First call errored.');
  }
  
  try {
    total += await oneOrErrorAsync();
  } catch(e) {
    throw new Error('Second call errored.');
  }
  
  console.log('After both calls...');
  console.log(`The total is ${total}.`);
})();
```

The code above reads similarly to the synchronous version, with sprinkles of `async` and `await`. This new syntax allows us to cut out a lot of boilerplate, which only gets worse the more involved the code is.

When the `await` expression runs, the async function will yield execution. When the promise is resolved, execution resumes with a return. Otherwise, when the promise is rejected, an error is thrown.

## Using `await*` for parallel execution

When we need to await the results of a collection of Promises, we can use the `await*`` syntax.

```
let results = await* [oneOrErrorAsync(), oneOrErrorAsync(), oneOrErrorAsync(), oneOrErrorAsync()];
```

The above will concurrently call `oneOrErrorAsync()` four times and wait for all of them to return a result, or one of them to error out.

Note that this is not the same as calling await four times.

```
const results [
  await oneOrErrorAsync(),
  await oneOrErrorAsync(),
  await oneOrErrorAsync(),
  await oneOrErrorAsync()
]
```

Each await in the above example would yield, essentially making each `oneOrErrorAsync()` call sequential.

## Further readings

- Jake Archibald has an [article](http://jakearchibald.com/2014/es7-async-functions/) written a year ago on ES7 and async-await.

- The ES7 [async function](https://github.com/lukehoban/ecmascript-asyncawait) proposal on GitHub.

- Also, check out the [async generator](https://github.com/jhusain/asyncgenerator) proposal, which adds asynchronous generator functions that return Observables instead of Promises.
