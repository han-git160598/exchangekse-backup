
var socket = io('https://hancutoi.herokuapp.com/');

socket.on('check-socket',function(data)
{
console.log(data);
});
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
socket.on('erro-serve',function(data)
{
    console.log(data);
    console.log('erro');
});
// socket.on('diem-g',function(data)
// {
//     console.log(data);
 
// });

