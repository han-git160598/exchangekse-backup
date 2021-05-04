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



server.listen(process.env.PORT || 3001);


const url = 'http://diendengiadung.com/api/'

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
var x, y, xy, coordinate_xy;
var time_open, time_block, time_close;
var G;
var flag = 0;

function check_time_block() {
    var ctb_interval = setInterval(function() {
        x = Math.floor((new Date().getTime()) / 1000);
        const data_round1 = { detect: 'check_time_block', session_time_break: x };
        axios.post(url, data_round1, {
            headers,
        }).then((res) => {
            if (res.data.success == "false") {
                const auto_create = { detect: 'auto_creat_session', stock_time_close: x };
                axios.post(url, auto_create, {
                    headers,
                }).then((res) => {

                }).catch((error) => {})
            } else {

                console.log('check_time_block')
                time_open = parseInt(res.data.data[0].time_open);
                time_block = parseInt(res.data.data[0].time_block);
                time_close = parseInt(res.data.data[0].time_close);
                G = JSON.parse(res.data.data[0].coordinate_g);
                flag = 1;
                clearInterval(ctb_interval);
            }

        }).catch((error) => {})

    }, 1000);
}
check_time_block();

setInterval(function() {
    if (flag == 1) {
        io.emit('check-socket', 'running');
        y = random_y(visits);
        visits = y;
        x = Math.floor((new Date().getTime()) / 1000);
        xy = { x: x, y: y };
        coordinate_xy = JSON.stringify(xy);
        try {
            if (time_block - 5 == x) {
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
                if (time_open <= x && time_block > x) {
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
                        G = JSON.parse(res.data.data[0].coordinate_g);
                    }).catch((error) => {})
                } else {
                    console.log('block');
                    const data_round = { detect: 'win_lose_trade', time_break: x };
                    switch (x) {
                        case time_block + 1:
                            axios.post(url, data_round, {
                                headers,
                            }).then((res) => {

                                if (res.data.data[0].result_trade == "up") {
                                    console.log('up');
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

                                } else {
                                    console.log('down');

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
                            }).catch((error) => {})
                            break;
                        case time_close - 1:
                            axios.post(url, data_round, {
                                headers,
                            }).then((res) => {
                                if (res.data.data[0].result_trade == "up") {
                                    console.log('up');
                                    console.log('finish');
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
                                    check_time_block();
                                } else {
                                    console.log('down');
                                    console.log('finish');
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
                                    check_time_block();
                                }
                            }).catch((error) => {})
                            break;
                        default:
                            console.log('default')
                            y = Math.round((TaoSoNgauNhien(G.y - 1, G.y + 1)) * 1000) / 1000;
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
                            break;
                    }
                }
            }
        } catch (e) {
            io.emit('erro-serve', e.message);

        }
    }
}, 1000);







app.get("/", function(req, res) {
    res.render("index");
});
app.get("/bep", function(req, res) {
    res.render("bep");
});
