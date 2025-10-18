throttle
========
Parallelize function execution in Node.js up to a defined limit.

Usually you either run functions one after the other sequentially or in parallel
simultaneously. However, many times it would be more helpful to run up to some
number of parallelized functions but fall back to serial beyond that. This Node.js
module provides a framework for this.

## Install
```sh
npm i @anders94/throttle
```

## Quick Start
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

await Promise.all([
    throttle.enqueue(async () => await wait(400)),
    throttle.enqueue(async () => await wait(300)),
    throttle.enqueue(async () => await wait(200)),
    throttle.enqueue(async () => await wait(100))
]);
console.log('All functions completed!');
```

In the above example, `const throttle = new Throttle(2)` initialized the throttle
to run up to `2` functions at the same time. We quickly enqueued 4 functions, each
waiting less and less time, so the first two start (`wait 400ms` and `wait 300ms`) but
the next two are enqueued but don't start executing. The first to finish is the
second function, (`wait 300ms`) so `wait 200ms` starts. Next to finish is the first
function, (`wait 400ms`) so `wait 100ms` starts next which ends soon after. Last
to end is `wait 200ms`.

**Output:**
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

## API Reference

### Constructor

#### `new Throttle(limit)`
Creates a new throttle instance.

- **limit** `{number}` - Maximum number of functions to run concurrently. Default: `2`

**Example:**
```js
const throttle = new Throttle(3); // Allow up to 3 concurrent functions
```

### Methods

#### `enqueue(fn)`
Adds a function to the execution queue. If there are available execution slots (below the limit), the function starts immediately. Otherwise, it waits in the queue.

- **fn** `{function}` - Function to execute (can be sync or async)
- **Returns:** `{Promise}` - Promise that resolves with the function's return value or rejects with any error thrown

**Example:**
```js
// Basic usage with promise
const result = await throttle.enqueue(() => 'Hello World');
console.log(result); // 'Hello World'

// With async functions
const data = await throttle.enqueue(async () => {
    const response = await fetch('https://api.example.com/data');
    return response.json();
});

// Error handling
try {
    await throttle.enqueue(() => {
        throw new Error('Something went wrong');
    });
} catch (error) {
    console.error(error.message); // 'Something went wrong'
}
```

#### `dequeue()`
Removes and returns the next task from the queue without executing it.

- **Returns:** `{object|undefined}` - The next queued task object containing `{fn, resolve, reject}`, or `undefined` if queue is empty

**Example:**
```js
const nextTask = throttle.dequeue();
if (nextTask) {
    console.log('Dequeued a task');
    // Note: Manual execution would require calling nextTask.fn() and handling nextTask.resolve/reject
}
```

#### `isEmpty()`
Checks if the queue is empty.

- **Returns:** `{boolean}` - `true` if no functions are queued, `false` otherwise

**Example:**
```js
if (!throttle.isEmpty()) {
    console.log('Still have functions waiting');
}
```

#### `length()`
Returns the number of functions currently in the queue (waiting to execute).

- **Returns:** `{number}` - Number of queued functions

**Example:**
```js
console.log(`${throttle.length()} functions waiting in queue`);
```

#### `clearQueue()`
Removes all pending functions from the queue and rejects their promises. Does not affect currently running functions.

- **Returns:** `{number}` - Number of tasks that were cleared from the queue

**Example:**
```js
// Add some functions to the queue
throttle.enqueue(() => 'task 1').catch(err => console.log('Cleared:', err.message));
throttle.enqueue(() => 'task 2').catch(err => console.log('Cleared:', err.message));

// Clear all pending tasks
const cleared = throttle.clearQueue();
console.log(`${cleared} tasks were cleared`); // "2 tasks were cleared"
```

#### `finish()`
Called when the queue becomes empty and all functions have completed. Currently a no-op but can be overridden.

- **Returns:** `undefined`

**Example:**
```js
throttle.finish = () => {
    console.log('All functions completed!');
};
```

### Properties

#### `limit`
The maximum number of functions that can run concurrently.

**Example:**
```js
console.log(`Current limit: ${throttle.limit}`);
throttle.limit = 5; // Change the limit dynamically
```

#### `running`
The number of functions currently executing.

**Example:**
```js
console.log(`${throttle.running} functions currently running`);
```

## Advanced Usage

### Error Handling
Functions that throw errors will reject their returned promise but won't stop the queue. The error is contained to that specific function:

```js
// This will reject the promise but not affect other functions
throttle.enqueue(async () => {
    throw new Error('This will not stop the queue');
}).catch(error => {
    console.error('Function failed:', error.message);
});

// This will still execute normally
throttle.enqueue(() => {
    console.log('This will still execute');
}).then(result => {
    console.log('Function completed successfully');
});
```

### Monitoring Queue Status
You can monitor the throttle state in real-time:

```js
const logStatus = () => {
    console.log(`Running: ${throttle.running}, Queued: ${throttle.length()}`);
};

throttle.enqueue(() => logStatus());
throttle.enqueue(() => logStatus());
throttle.enqueue(() => logStatus());
```

### Custom Completion Handling
Override the `finish()` method to handle queue completion:

```js
throttle.finish = () => {
    console.log('All tasks completed successfully!');
    process.exit(0);
};
```

### Queue Cleanup
Use `clearQueue()` for cleanup scenarios like application shutdown:

```js
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down...');
    const cleared = throttle.clearQueue();
    console.log(`Cancelled ${cleared} pending tasks`);
    process.exit(0);
});
```

## License
MIT
