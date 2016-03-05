/***
 *   Sync 框架
 *
 *   支持 addTask,  addCirle,  addListener,  finish 等功能
 *
 */
(function() {

    var MAX_TOTAL = Math.pow(2, 31);

    function Sync(delay) {
        this.delay = delay;
        this.queue = [];            //执行队列  
        this.listeners = [];            //listeners  
        this.timer = 0;
        this.count = 0;             //总的计数  
    }

    Sync.prototype.setDelay = function(delay) {
        this.delay = delay;
        return this;
    }

    Sync.prototype.addListener = function(func) {
        this.listeners.push(func);
        return this;
    }

    Sync.prototype.removeListener = function(func) {
        var pos = this.listeners.indexOf(func)
        if (pos != -1) {
            this.listeners.splice(pos);
        }
        return this;
    }

    Sync.prototype.addTask = function(func, callback) {
        this.addCircle(1, func, callback);
        return this;
    }

    Sync.prototype.addParallelTask = function(/** func1, func2, func3...  **/) {
        this.addCircle(1, function(index) {
            for(var i = 0; i < arguments.length; i++) {
                var func = arguments[i];
                func(index);
            }
        });
        return this;
    }

    Sync.prototype.addCircle = function(total, func, callback) {
        if (typeof(total) == 'function') {
            func = total;
            total = MAX_TOTAL;
        }
        this.queue.push({
            func : func,
            total : total,
            index : 0,
            callback : callback
        });
        this.checkStart();
        return this;
    }

    Sync.prototype.checkStart = function(total, func) {
        if (this.timer) {
            return;
        }
        var that = this;
        this.timer = setTimeout(function() {
            var task = that.queue[0];
            if (!task) {
                that.timer = 0;
                return ;
            }
            var ret = that._execute(task, task.index);
            if (ret === true || ++task.index >= task.total) {
                that.queue.shift();
                that._callback(task);
            }
            that.timer = setTimeout(arguments.callee, that.delay);
        }, this.delay);
    }

    Sync.prototype._execute = function(task, index) {
        var ret = task.func(index);
        for(var i = 0; i < this.listeners.length; i++) {
            this.listeners[i](this.count++);
        }
    }

    Sync.prototype._callback = function(task) {
        task.callback && task.callback(index);
    }

    Sync.prototype.finish = function(bool) {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = 0;
        }
        if (bool === undefined || bool === true) {
            for(var i = 0; i < this.queue.length; i++) {
                var task = this.queue[i];
                for(var j = task.index; j < task.total; j++) {
                    var ret = this._execute(task, j);
                    if (ret === true) {
                        break;
                    }
                }

            }
        }
        this.queue = [];
    }


    window.Sync = Sync;


})();  