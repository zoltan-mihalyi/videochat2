define(['runnable'], function () {
    function Network(controller) {
        this.controller = controller;
        this.disconnected = true;
    }

    Network.prototype.connect = function (onwaiting, onready) {
        var network = this;
        var started = false;
        this.ws = new WebSocket(this.controller.url);

        this.ws.onopen = function () {
            this.disconnected = false;
            onwaiting();
        };

        this.ws.onclose = function () {
            network.disconnect();
        }

        this.ws.onmessage = function (evt) {
            if (!started) {
                if (evt.data === 'START') {
                    started = true;
                    onready();
                }
                return;
            }
            if (evt.data === 'RECONNECT') {
                network.controller.emit('reconnect');
            }

            if (typeof evt.data === 'string') {
                network.controller.emit('message', evt.data);
            } else {
                var fileReader = new FileReader();
                fileReader.onload = function () {
                    network.controller.emit('message', this.result);
                };
                fileReader.readAsArrayBuffer(evt.data);
            }

        };
    };

    Network.prototype.isCrowded = function () {
        return this.ws.bufferedAmount > 40000;
    };

    Network.prototype.send = function (data) {
        try {
            if (this.ws.readyState === this.ws.OPEN) {
                this.ws.send(data);
            } else {
                throw new Error('not open');
            }
        } catch (e) {
            this.disconnect();
        }
    };

    Network.prototype.disconnect = function () {
        if (this.disconnected) {
            return;
        }
        this.disconnected = true;
        this.controller.emit('disconnect');
    };

    return Network;
});