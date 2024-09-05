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
