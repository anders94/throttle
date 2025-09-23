throttle
========
Parallelize function execution in Node.js up to a defined limit.

Usually you either run functions one after the other sequentially or in parallel
simultaneously. However, many times it would be more helpful to run up to some
number of parallelized functions but fall back to serial beyond that. This Node.js
module provides a framework for this.

Install
-------
```sh
npm i @anders94/throttle
```

Usage
-----
Once you `enqueue()` functions, they immediately start to execute.

```js
const Throttle = require('@anders94/throttle');

const throttle = new Throttle(2);

// wrap setTimeout in a promise
const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const wait = async (delay) => {
    console.log('start', delay, 'ms timer.');
    await timeout(delay);
    console.log('end', delay, 'ms timer.');

}

throttle.enqueue(async () => await wait(400));
throttle.enqueue(async () => await wait(300));
throttle.enqueue(async () => await wait(200));
throttle.enqueue(async () => await wait(100));
```
In the above example, `const throttle = new Throttle(2)` initialized the throttle
to run up to `2` functions at the same time. We quickly enqueued 4 functions, each
waiting less and less time, so the first two start (`wait 400ms` and `wait 300ms`) but
the next two are enqueued but don't start executing. The first to finish is the
second function, (`wait 300ms`) so `wait 200ms` starts. Next to finish is the first
function, (`wait 400ms`) so `wait 100ms` starts next which ends soon after. Last
to end is `wait 200ms`.

Output:
```
start 400 ms timer.
start 300 ms timer.
end 300 ms timer.
start 200 ms timer.
end 400 ms timer.
start 100 ms timer.
end 100 ms timer.
end 200 ms timer.
```
