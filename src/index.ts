import { WechatyBuilder } from "wechaty";
import qrcodeTerminal from "qrcode-terminal";
//不提交微信口令认证文件
import axios from 'axios';
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
      .on('ready', async () => {
        try {
          // 获取指定名称的群
          const room = await bot.Room.find({ topic: '鞋类监控' });
          if (!room) {
            console.log('找不到指定的群');
            return;
          }
          // 开始定时器
          setInterval(async () => {
            // 发送消息
            const msg = await mainRank();
            await room.say(msg);
          }, 1 * 60 * 1000); // 10分钟，单位为毫秒
        } catch (e) {
          console.error(e);
        }
      })
      .on("logout", onLogout) // 机器人登出
    bot
      .start()
      .then(() => console.log("Start to log in wechat..."))
      .catch((e: any) => console.error(e));
  } catch (error) {
    console.log("init error: ", error);
  }
}



async function mainRank(): Promise<string> {
  // 获取排名
  const rank = await getRank();
  if (!rank) {
    console.log('获取排名失败');
    return '获取排名失败';
  }
  // 把日志格式化成这样的格式
  // rank = [{'keywords': 'rank', 'shop_rank': ['1231231', '123']}, {'keywords': 'rank', 'shop_rank': ['1231231', '123']}]
  // 当前关键字排名 关键字：xxx,前三的店铺：xxx,xxx,xxx ,
  // 如果有相同的关键字，就拿列表最后的rank数据
  // 1.先把关键字拿出来
  const allKeyword = Array.from(new Set(rank.map(r => r.keywords)));
  // 2.拿到每个关键字的前三的店铺
  let msg = '';
  for (const keyword of allKeyword) {
    // 拿到每个关键字的前三的店铺
    let shopRank: string[] = [];
    for (const r of rank) {
      if (r.keywords === keyword) {
        shopRank = r.shop_rank;
      }
    }
    msg += `关键字：${keyword},前三的店铺：${shopRank.slice(0, 3).join(',')}\n`;
  }
  // 返回消息
  if (msg) {
    return msg;
  } else {
    console.log('没有排名数据');
    return '没有排名数据';
  }
}

async function getRank(): Promise<any> {
  try {
    const url = 'http://182.42.133.178:5556/rank';
    const res = await axios.get(url);
    return res.data;
  } catch (e) {
    console.log(e);
  }
}