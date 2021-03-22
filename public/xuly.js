
var socket = io('https://kse-trading.herokuapp.com/');
socket.on('toa-do',function (params) {
    console.log(params);
});
socket.on('coordinates_real',function (params) {
    console.log(params);
});
socket.on('block-trading',function(data)
{
console.log(data);
});
socket.on('check-result',function(data)
{
console.log(data);
});