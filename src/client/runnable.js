define([], function () {
    function Runnable() {
        this.intervalId = null;
    }

    Runnable.prototype.start = function () {
        if (this.intervalId !== null) {
            throw new Error('Already running');
        }
        var runnable = this;
        this.intervalId = setInterval(function () {
            runnable.run();
        }, 16);
    };

    Runnable.prototype.stop = function () {
        if (this.intervalId === null) {
            throw new Error('Not running');
        }
        clearInterval(this.intervalId);
        this.intervalId = null;
    };

    return Runnable;
});