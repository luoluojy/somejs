/**
 * @fileoverview 接收报警器转发出来的数据
 * @author CHENG十
 */

/*创建TCP服务器*/
var net = require('net');
var iconv = require('iconv-lite'); // 用来对传过来的gbk编码的Base64的Buffer进行解码

var server = net.createServer(function (socket) {
    console.log('客户端与服务端链接已建立');

    // 每十秒发送一次心跳检测
    setInterval(() => {
        // 当socket被销毁时，确保不再
        socket.write(Buffer.from('$keeplink###0|&|').toString('base64')); //发送给客户端
    }, 10000);

    //socket.setEncoding('utf8');		
    socket.on('data', function (data) {
        var info = iconv.decode(Buffer.from(data.toString(), 'base64'), 'GBK'); // 按照GBK解析命令数据
        console.log(info) // 命令帧

        if (info.indexOf('newalarm') != -1) { // 当接收到是报警命令时
            // 根据协议格式，解析报警信息
            const items = info.split('###'); //获取具体报警参数值
            const lastItem = items[items.length - 1].substring(0, items[items.length - 1].length - '|&|'.length); // 处理最后一个参数

            console.log(`报警时刻：${items[1]}，用户名称：${items[2]}，用户地址${items[3]}，主叫号码：${items[4]}，主机编号：${items[5]}，主机类型：${items[6]}`);
            console.log(`探头编号：${items[7]}，探头安装位置：${items[8]}，报警内容：${items[9]}，所属区域：${items[10]}，联系人：${items[11]}，报警通道：${lastItem}`);

            // 发送应答帧
            socket.write(Buffer.from(iconv.encode('$ACK' + info.substring(1), 'GBK')).toString('base64'));
        }
    });

    socket.on('error', function (err) {
        console.log(err);
    });

    socket.on('end', function () {
        console.log('客户端连接被关闭')
    });

    socket.on('close', function (err) {
        console.log('socket端口被关闭')
    });
});
// ip可以随意指定，可以为对应的app服务器地址
server.listen(2150, '172.15.182.215', function () {
    console.log('listening')
});

server.on('close', function () {
    console.log('TCP服务器被关闭');
})