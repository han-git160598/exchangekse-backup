const express = require("express");
const app = express();
const axios = require('axios')
const cors = require("cors");
const cron = require("node-cron");
const mysql = require("mysql2");
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
const io = require('socket.io')(server, {
    pingTimeout: 86400000,
    pingInterval: 1000,
    cors: {
        origin: '*',
    }
});



server.listen(process.env.PORT || 5000);



const url = 'http://diendengiadung.com/api/';
//const url = 'http://192.168.100.22/kse_trade/api/' // locals
const headers = { 'Authorization': 'Basic YWRtaW46cXRjdGVrQDEyMwx==' }
io.on("connection", function(socket) {
    io.sockets.emit('ket-noi', 'welcome to socket');

    socket.on('force_sign_out', function(data) {
        io.sockets.emit('forced_sign_out', data);
    });
});

function TaoSoNgauNhien(min, max) {
    return Math.random() * (max - min) + min;
}

function random_y(number) {
    return Math.round((number + (Math.random() < 0.5 ? 1 : -1) * Math.random()) * 1000) / 1000;
}
var visits = 23000;
setInterval(function() {

    io.emit('check-socket', 'running');
    var y = random_y(visits);
    visits = y;
    var x = Math.floor((new Date().getTime()) / 1000);
    var xy = { x: x, y: y };
    var coordinate_xy = JSON.stringify(xy);

    const data_round1 = { detect: 'check_time_block', session_time_break: x };
    axios.post(url, data_round1, {
        headers,
    }).then((res) => {
        try {
            if (res.data.success == "false") {
                const auto_create = { detect: 'auto_creat_session', stock_time_close: x };
                axios.post(url, auto_create, {
                    headers,
                }).then((res) => {

                }).catch((error) => {})
            } else {
                if (res.data.data[0].time_block - 15 == x) {
                    console.log('15s');
                    var G = JSON.parse(res.data.data[0].coordinate_g);
                    if (G.y <= y) {
                        y = TaoSoNgauNhien(G.y + 1, G.y + 2);
                    } else {
                        y = TaoSoNgauNhien(G.y - 1, G.y - 2);
                    }
                    visits = y;
                    xy = { x: x, y: y };
                    coordinate_xy = JSON.stringify(xy);
                    io.emit('coordinates_real', coordinate_xy);
                    io.emit('block-trading', { notification: 'unlock_trading' });
                    const data_add_coordinate = {
                        detect: 'add_coordinate',
                        coordinate_xy: coordinate_xy,
                        time_present: x,
                        session_time_open: x
                    };
                    axios.post(url, data_add_coordinate, {
                        headers,
                    }).then((res) => {
                        io.emit('diem-g', res.data.data[0].coordinate_g);

                    }).catch((error) => {})
                } else {
                    if (res.data.data[0].status_trade == 'trading') {
                        console.log('trading');
                        io.emit('coordinates_real', coordinate_xy);
                        io.emit('block-trading', { notification: 'unlock_trading' });
                        const data_add_coordinate = {
                            detect: 'add_coordinate',
                            coordinate_xy: coordinate_xy,
                            time_present: x,
                            session_time_open: x
                        };
                        axios.post(url, data_add_coordinate, {
                            headers,
                        }).then((res) => {
                            io.emit('diem-g', res.data.data[0].coordinate_g);
                        }).catch((error) => {})
                    }
                    if (res.data.data[0].status_trade == 'block') {
                        console.log('block');

                        const data_round = { detect: 'win_lose_trade', time_break: x };
                        axios.post(url, data_round, {
                            headers,
                        }).then((res) => {

                            if (res.data.data[0].result_trade == "up") {
                                console.log('up');
                                var a = parseInt(res.data.data[0].time_close);
                                var b = Math.floor((new Date().getTime()) / 1000);

                                if (parseInt(res.data.data[0].time_close) == Math.floor((new Date().getTime()) / 1000)) {
                                    console.log('finish');
                                    var G = JSON.parse(res.data.data[0].coordinate_g);
                                    y = TaoSoNgauNhien(G.y + 0.7, G.y + 1);
                                    visits = y;
                                    coordinate_xy = JSON.stringify({ x: x, y: y });

                                    io.emit('coordinates_real', coordinate_xy);
                                    io.emit('check-result', { reload_money: 'reload_money' });
                                    io.emit('block-trading', { notification: 'block_trading' });

                                    const data_add_coordinate = {
                                        detect: 'add_coordinate',
                                        coordinate_xy: coordinate_xy,
                                        time_present: x,
                                        session_time_open: x
                                    };
                                    axios.post(url, data_add_coordinate, {
                                        headers,
                                    }).then((res) => {

                                    }).catch((error) => {})
                                } else {
                                    console.log('break');
                                    var G = JSON.parse(res.data.data[0].coordinate_g);
                                    y = Math.round((TaoSoNgauNhien(G.y - 0.8, G.y + 0.7)) * 1000) / 1000;
                                    visits = y;
                                    coordinate_xy = JSON.stringify({ x: x, y: y });
                                    io.emit('coordinates_real', coordinate_xy);
                                    io.emit('block-trading', { notification: 'block_trading' });
                                    const data_add_coordinate = {
                                        detect: 'add_coordinate',
                                        coordinate_xy: coordinate_xy,
                                        time_present: x,
                                        session_time_open: x
                                    };
                                    axios.post(url, data_add_coordinate, {
                                        headers,
                                    }).then((res) => {

                                    }).catch((error) => {})
                                }
                            } else {
                                console.log('down');
                                var a = parseInt(res.data.data[0].time_close);
                                var b = Math.floor((new Date().getTime()) / 1000);

                                if (parseInt(res.data.data[0].time_close) == Math.floor((new Date().getTime()) / 1000)) {
                                    console.log('finish');
                                    var G = JSON.parse(res.data.data[0].coordinate_g);
                                    y = TaoSoNgauNhien(G.y - 0.7, G.y - 0.9);
                                    visits = y;
                                    coordinate_xy = JSON.stringify({ x: x, y: y });
                                    io.emit('coordinates_real', coordinate_xy);
                                    io.emit('check-result', { reload_money: 'reload_money' });
                                    io.emit('block-trading', { notification: 'block_trading' });
                                    const data_add_coordinate = {
                                        detect: 'add_coordinate',
                                        coordinate_xy: coordinate_xy,
                                        time_present: x,
                                        session_time_open: x
                                    };
                                    axios.post(url, data_add_coordinate, {
                                        headers,
                                    }).then((res) => {

                                    }).catch((error) => {})
                                } else {
                                    console.log('break');
                                    var G = JSON.parse(res.data.data[0].coordinate_g);
                                    y = Math.round((TaoSoNgauNhien(G.y - 0.8, G.y + 0.7)) * 1000) / 1000;
                                    visits = y;
                                    coordinate_xy = JSON.stringify({ x: x, y: y });
                                    io.emit('coordinates_real', coordinate_xy);
                                    io.emit('block-trading', { notification: 'block_trading' });
                                    const data_add_coordinate = {
                                        detect: 'add_coordinate',
                                        coordinate_xy: coordinate_xy,
                                        time_present: x,
                                        session_time_open: x
                                    };
                                    axios.post(url, data_add_coordinate, {
                                        headers,
                                    }).then((res) => {

                                    }).catch((error) => {})
                                }

                            }
                        }).catch((error) => {})
                    }
                }
            }

        } catch (e) {
            io.emit('erro-serve', e.message);
        }



    }).catch((error) => {})

}, 1000);






app.get("/", function(req, res) {
    res.render("index");
});
app.get("/bep", function(req, res) {
    res.render("bep");
});
