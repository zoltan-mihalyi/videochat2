define(['runnable'], function (Runnable) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    function drawScaled(src, target){
        canvas.width = src.width;
        canvas.height = src.height;
        ctx.putImageData(src, 0, 0, 0, 0, src.width, src.height);
        target.getContext('2d').drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, target.width, target.height);
    }

    function Display(controller) {
        Runnable.call(this);
        this.controller = controller;
        this.remoteCtx = controller.remoteCanvas.getContext('2d');
        this.localCtx = controller.localCanvas.getContext('2d');
    }

    Display.prototype = new Runnable();

    Display.prototype.updateLocal = function (image) {
        drawScaled(image, this.controller.localCanvas);
    }

    Display.prototype.run = function () {
        var image = this.controller.processor.getImageIfHasNew();
        if (image !== null) {
            drawScaled(image, this.controller.remoteCanvas);
        }
    };

    return Display;
});