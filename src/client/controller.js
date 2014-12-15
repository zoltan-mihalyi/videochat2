define(['display', 'network', 'painter', 'processor', 'stream'], function (Display, Network, Painter, Processor, Stream) {

    function setStatus(status) {
        document.getElementById('status').innerHTML = status;
    }

    function Controller(local, remote, paint, messages, message, form) {
        this.localCanvas = local;
        this.remoteCanvas = remote;
        this.paint = paint;
        this.url = 'ws://videochat.herokuapp.com';

        this.events = {};

        this.network = new Network(this);
        this.stream = new Stream(this);
        this.processor = new Processor(this);
        this.display = new Display(this);

        this.painter = new Painter(paint, this);

        this.on('disconnect', function () {
            setStatus('Disconnected');
        });
        this.on('reconnect', function () {
            setStatus('Waiting for another user...');
        });

        this.messages = messages;

        var controller = this;

        form.onsubmit = function () {
            controller.network.send('MESSAGE,' + message.value);
            messages.innerHTML += 'Én: ' + message.value + '<br/>';
            messages.scrollTop = Infinity
            message.value = '';
            return false;
        };
    }

    Controller.prototype.start = function () {
        var controller = this;

        controller.stream.start(function () {
            controller.network.connect(function () {
                setStatus('Waiting for another user...');
            }, function () {
                setStatus('Running');
                controller.processor.start();
                controller.display.start();
            });
        }, function () {
            console.log('Failed to start webcam.')
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