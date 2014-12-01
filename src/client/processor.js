define(['runnable'], function (Runnable) {
    function Buffer(onimage) {
        this.sizes = [];
        this.images = [];
        this.onimage = onimage;
    }

    Buffer.prototype.check = function () {
        for (var i = 0; i < this.sizes.length; i++) {
            var size = this.sizes[i];
            var byteSize = size.w * size.h * 4;
            for (var j = 0; j < this.images.length; j++) {
                if (this.images[j].byteLength === byteSize) {
                    this.onimage({w: size.w, h: size.h, image: this.images[j]});
                    this.sizes.splice(i, 1);
                    this.images.splice(j, 1);
                    return;
                }
            }
        }
    };

    Buffer.prototype.addSize = function (w, h) {
        this.sizes.push({w: w, h: h});
        this.check();
    };

    Buffer.prototype.addImage = function (img) {
        this.images.push(img);
        this.check();
    };

    function Processor(controller) {
        var processor = this;

        this.quality = 1000;

        this.buffer = new Buffer(function (image) {
            processor.onimage(image);
        });

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
            this.quality = Math.round(this.quality / 2);
            this.quality = Math.max(this.quality, 1000);
            return;
        }
        this.quality = Math.round(this.quality * 1.1);
        this.quality = Math.min(this.quality, this.controller.stream.getMaxQuality());

        var img = this.controller.stream.captureImageIfHasNew(this.quality);
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
                this.buffer.addSize(Number(msg[1]), Number(msg[2]));
            }
        } else {
            this.buffer.addImage(msg);
        }
    };

    Processor.prototype.onimage = function (image) {
        this.lastImage = image;
        this.dirty = true;
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
        var imageData = this.ctx.createImageData(this.lastImage.w, this.lastImage.h);
        //TODO the loop is slow but this does not work. imageData.data.set(msg);
        var clampedArray = new Uint8ClampedArray(this.lastImage.image)
        for (var i = 0; i < clampedArray.length; i++) {
            imageData.data[i] = clampedArray[i];
        }
        return imageData;
    };

    return Processor;
});