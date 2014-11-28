define([], function () {
    function Stream() {
        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.hasNew = true;
    }

    Stream.prototype.getUserMedia = function (onready, onerror) {
        navigator.webkitGetUserMedia({
            video: true, toString: function () {
                return 'video';
            }
        }, onready, onerror);
    };

    Stream.prototype.start = function (onready, onerror) {
        var stream = this;
        this.getUserMedia(function (localMediaStream) {
            stream.video.src = URL.createObjectURL(localMediaStream);
            stream.video.onloadedmetadata = function () {
                stream.video.play();
                stream.video.ontimeupdate = function () {
                    stream.hasNew = true;
                }
                onready();
            };
        }, onerror);
    };

    Stream.prototype.captureImageIfHasNew = function (size) {
        if (!this.hasNew) {
            //return null;
        }
        this.hasNew = false;

        var w = this.video.videoWidth;
        var h = this.video.videoHeight;
        var origSize = w * h;
        if (origSize > size) {
            var factor = Math.sqrt(size / origSize);
            w = Math.round(w * factor);
            h = Math.round(h * factor);
        }
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx.drawImage(this.video, 0, 0, w, h);
        return this.ctx.getImageData(0, 0, w, h);
    };

    return Stream;
});