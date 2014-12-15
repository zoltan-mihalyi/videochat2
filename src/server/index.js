var WebSocketServer = require('ws').Server;
var http = require('http');


var httpServer = http.createServer(function (req, resp) {
    resp.end('WS server');
}).listen(process.env.PORT || 3000);

var wss = new WebSocketServer({server: httpServer});

var rooms = [];
var waiting = null;


function createRoom(other) {
    var room = [waiting, other];
    waiting.room = room;
    other.room = room;
    rooms.push(room);
    other.send('START');
    waiting.send('START');

    waiting = null;
}

function findOther(ws) {
    var room = ws.room;
    if (room[0] === ws) {
        return room[1];
    } else {
        return room[0];
    }
}

function newConnection(ws) {
    if (waiting) {
        console.log('create room');
        createRoom(ws);
    } else {
        console.log('waiting');
        waiting = ws;
    }
}


wss.on('connection', function connection(ws) {
    newConnection(ws);

    ws.on('message', function (message) {
        if (typeof  message === 'string') {
            if (message.split(',')[0] === 'LINE') {
                ws.send(message);
            }
        }
        if (ws.room) {
            var other = findOther(ws);
<<<<<<< HEAD
            if (other._socket.bufferSize > 40000) {
                if (other.mypaused) {
                    console.log("resume");
                    other._socket.resume();
                    other.mypaused = false;
                }
                console.log("pause");
                ws.mypaused = true;
                ws._socket.pause();
            } else if (other._socket.bufferSize === 0 && ws.mypaused) {
                console.log("resume");
                ws.mypaused = false;
                ws._socket.resume();
            }
=======
>>>>>>> 2fe1d2c22b21106886251830a17b991158daefbc
            try {
                other.send(message);
            } catch (e) {
            }
        }
    });

    ws.on('close', function () {
        if (ws.room) {
            var other = findOther(ws);
            rooms.splice(rooms.indexOf(ws.room), 1);
            ws.room = null;
            other.room = null;
            ws.room = null;
            console.log('dispose room');
            try {
                other.send('RECONNECT');
                other.resume();
                newConnection(other);
            } catch (e) {
            }
        } else {
            if (waiting === ws) {
                waiting = null;
                console.log('dewaiting');
            }
        }
    });
});

setInterval(function () {
    for(var i=0;i<rooms.length;i++){
        var room=rooms[i];
        for(var j=0;j<=1;j++){
            if(room[j]._socket.bufferSize>20000){
                room[1-j]._socket.pause();
            }else{
                room[1-j]._socket.resume();
            }
        }
    }
},500);
