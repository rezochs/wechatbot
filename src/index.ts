import { WechatyBuilder } from "wechaty";
import qrcodeTerminal from "qrcode-terminal";
//不提交微信口令认证文件
const startTime = new Date();
let bot: any = {};
initProject();
function onScan(qrcode) {
  console.log("Scan QR Code to login: ", qrcode);
  qrcodeTerminal.generate(qrcode, { small: true }); // 在console端显示二维码
  const qrcodeImageUrl = [
    "https://api.qrserver.com/v1/create-qr-code/?data=",
    encodeURIComponent(qrcode),
  ].join("");

  console.log(qrcodeImageUrl);
}

async function onLogin(user: any) {
  console.log(`${user} has logged in`);
  const date = new Date();
  console.log(`Current time:${date}`);
}

function onLogout(user: any) {
  console.log(`${user} has logged out`);
}

async function initProject() {
  try {
    bot = WechatyBuilder.build({
      name: "WechatEveryDay",
      puppet: "wechaty-puppet-wechat", // 如果有token，记得更换对应的puppet
      puppetOptions: {
        uos: true,
      },
    });

    bot
      .on("scan", onScan) // 机器人需要扫描二维码时监听回调
      .on("login", onLogin) // 登录
      .on('message', (message: string) => console.log('收到消息：' + message)) // 收到消息
      .on("logout", onLogout) // 机器人登出
    bot
      .start()
      .then(() => console.log("Start to log in wechat..."))
      .catch((e: any) => console.error(e));
  } catch (error) {
    console.log("init error: ", error);
  }
}