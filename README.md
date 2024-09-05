throttle-js
===========
Parallelize function execution up to a defined limit.

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
