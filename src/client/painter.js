define([], function () {
    function Painter(canvas, controller) {
        this.canvas = canvas;

        var last = null;
        var button;

        canvas.onmousedown = function (e) {
            last = e;
            button = e.button;
        };
        document.body.onmouseup = function () {
            last = null
        };
        canvas.onmousemove = function (e) {
            if (last !== null) {
                var mode = button == 0 ? '0' : '1';
                controller.network.send('LINE,' + mode + ',' + last.layerX + ',' + last.layerY + ',' + e.layerX + ',' + e.layerY);
                last = e;
            }
        };
        canvas.oncontextmenu = function () {
            return false;
        };
    }

    Painter.prototype.line = function (mode, x1, y1, x2, y2) {
        var ctx = this.canvas.getContext('2d');
        ctx.lineCap = 'round';
        if (mode) {
            ctx.lineWidth = 40;
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'black';
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
    }

    return Painter;
});