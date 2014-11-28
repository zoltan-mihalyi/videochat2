define(['runnable'], function (Runnable) {
    function Display(controller) {
        Runnable.call(this);
        this.controller = controller;
        this.remoteCtx = controller.remoteCanvas.getContext('2d');
        this.localCtx = controller.localCanvas.getContext('2d');
    }

    Display.prototype = new Runnable();

    Display.prototype.updateLocal = function (image) {
        var localCanvas = this.controller.localCanvas;
        this.localCtx.putImageData(image, 0, 0, 0, 0, localCanvas.width, localCanvas.height);

    }

    Display.prototype.run = function () {
        var image = this.controller.processor.getImageIfHasNew();
        if (image !== null) {
            this.remoteCtx.putImageData(image, 0, 0);
        }
    };

    return Display;
});