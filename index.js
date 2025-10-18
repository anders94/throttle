module.exports =
    class Throttle {
	constructor(limit) {
	    this.todo = [];
	    this.running = 0;
	    this.limit = limit ? limit : 2;

	}

	enqueue = (f) => {
	    return new Promise((resolve, reject) => {
		this.todo.push({ fn: f, resolve, reject });
		this.run();
	    });

	}

	dequeue = () => this.todo.shift();

	isEmpty = () => this.todo.length == 0;

	length = () => this.todo.length;

	clearQueue = () => {
	    const cleared = this.todo.splice(0);
	    cleared.forEach(task => {
		task.reject(new Error('Queue cleared'));
	    });
	    return cleared.length;
	};

	finish = () => {};

	run = async () => {
	    if (this.running < this.limit) {
		this.running++;
		const task = this.dequeue();
		if (task) {
		    try {
			const result = await task.fn();
			task.resolve(result);
		    } catch (error) {
			task.reject(error);
		    }
		}
		this.running--;
		if (!this.isEmpty())
		    this.run();
		else
		    this.finish();

	    }

	};

    };
