const express = require("express");
const app = express();
const port = 3000;
const PROJECT_DOMAIN = process.env.PROJECT_DOMAIN;
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var sh = require('shelljs');
var wspath = sh.exec('echo $PROJECT_INVITE_TOKEN | sha1sum | head -c 6', { silent: true }).stdout;
var request = require("request");
var fs = require("fs");
var path = require("path");

app.get("/", (req, res) => {
res.send("hello wolrd");
});

//获取系统进程表
app.get("/status", (req, res) => {
let cmdStr = "pgrep -a";
exec(cmdStr, function (err, stdout, stderr) {
if (err) {
res.type("html").send("<pre>命令行执行错误:\n" + err + "</pre>");
} else {
res.type("html").send("<pre>命令行执行结果:\n" + stdout + "</pre>");
}
});
});

//启动web
app.get("/start", (req, res) => {
let cmdStr =
"bash start.sh";
exec(cmdStr, function (err, stdout, stderr) {
if (err) {
res.send("命令行执行错误:" + err);
} else {
console.log("Share Link: " + stdout);
res.send("命令行执行结果:" + "启动成功!");
}
});
});

//获取系统版本、内存信息
app.get("/info", (req, res) => {
let cmdStr = "cat /etc/*release | grep -E ^NAME";
exec(cmdStr, function (err, stdout, stderr) {
if (err) {
res.send("命令行执行错误:" + err);
} else {
res.send(
"命令行执行结果:\n" +
"Linux System:" +
stdout +
"\nRAM:" +
os.totalmem() / 1000 / 1000 +
"MB"
);
}
});
});

//文件系统只读测试
app.get("/test", (req, res) => {
fs.writeFile("./test.txt", "这里是新创建的文件内容!", function (err) {
if (err) res.send("创建文件失败,文件系统权限为只读:" + err);
else res.send("创建文件成功,文件系统权限为非只读:");
});
});

app.use(
'/' + wspath + '*',
createProxyMiddleware({
target: "http://127.0.0.1:8080/",
changeOrigin: true,
ws: true,
logLevel: 'error',
onProxyReq: function onProxyReq(proxyReq, req, res) { },
})
);

app.listen(port, () => console.log(Example app listening on port ${port}!));
