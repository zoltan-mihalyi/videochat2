define(['display', 'network', 'painter', 'processor', 'stream'], function (Display, Network, Painter, Processor, Stream) {

    function Controller(local, remote, localPaint, remotePaint) {
        this.localCanvas = local;
        this.remoteCanvas = remote;
        this.localPaint = localPaint;
        this.remotePaint = remotePaint;
        this.url = 'ws://localhost:3000/';

        this.events = {};

        this.network = new Network(this);
        this.stream = new Stream(this);
        this.processor = new Processor(this);
        this.display = new Display(this);

        this.painter = new Painter(localPaint);

        this.on('disconnect', function () {
            console.log('Disconnected');
        });
        this.on('reconnect', function () {
            console.log('Reconnecting...');
        });
    }

    Controller.prototype.start = function () {
        var controller = this;

        controller.stream.start(function () {
            controller.network.connect(function () {
                console.log('waiting');
            }, function () {
                console.log('ready');
                controller.processor.start();
                controller.display.start();
            });
        }, function () {
            console.log('webcam error')
        });
    };

    Controller.prototype.on = function (event, listener) {
        this.events[event] = this.events[event] || [];
        this.events[event].push(listener);
    };

    Controller.prototype.emit = function (event, data) {
        if (this.events[event]) {
            for (var i = 0; i < this.events[event].length; i++) {
                this.events[event][i](data);
            }
        }
    };

    return Controller;
});