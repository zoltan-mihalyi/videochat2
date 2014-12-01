define(['runnable'], function (Runnable) {
    function Processor(controller) {
        var processor = this;

        this.lastSize = {
            w: 1,
            h: 1
        };
        this.lastImage = null;
        this.dirty = false;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        Runnable.call(this);
        this.controller = controller;
        controller.on('message', function (msg) {
            processor.onmessage(msg);
        });
        controller.on('disconnect', function () {
            processor.ondisconnect();
        });
    };

    Processor.prototype = new Runnable();

    Processor.prototype.run = function () {
        if (this.controller.network.isCrowded()) {
            return;
        }

        var img = this.controller.stream.captureImageIfHasNew(20000);
        if (img !== null) {
            this.controller.display.updateLocal(img);
            this.controller.network.send('SIZE,' + img.width + ',' + img.height);
            this.controller.network.send(img.data);
        }
    };

    Processor.prototype.onmessage = function (msg) {
        if (typeof msg === 'string') {
            msg = msg.split(',');
            if (msg[0] === 'SIZE') {
                this.lastSize.w = Number(msg[1]);
                this.lastSize.h = Number(msg[2]);
            }
        } else {
            this.lastImage = msg;
            this.dirty = true;
        }
    };

    Processor.prototype.ondisconnect = function () {
        try {
            this.stop();
        } finally {
        }
    };

    Processor.prototype.getImageIfHasNew = function () {
        if (!this.dirty) {
            return null;
        }
        this.dirty = false;
        var imageData = this.ctx.createImageData(this.lastSize.w, this.lastSize.h);
        //TODO the loop is slow but this does not work. imageData.data.set(msg);
        var clampedArray = new Uint8ClampedArray(this.lastImage)
        for (var i = 0; i < clampedArray.length; i++) {
            imageData.data[i] = clampedArray[i];
        }
        return imageData;
    };

    return Processor;
});