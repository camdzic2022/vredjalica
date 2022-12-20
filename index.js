const fetch = require("node-fetch");
const WebSocket = require("ws");

let token = "";
let author = "";

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

let urls = [
  "https://zajebanko.com/smijesne-uvrede-vicevi/",
  "https://zajebanko.com/smijesne-uvrede-vicevi/2/",
  "https://zajebanko.com/smijesne-uvrede-vicevi/3/",
];

(async function () {
  let vrijedjalica = [];
  urls.forEach(async (url) => {
    await fetch(url)
      .then((x) => {
        return x;
      })
      .then((x) => {
        return x.text();
      })
      .then((elem) => {
        regexvrijedjanja(elem).forEach((x) => {
          vrijedjalica.push(x);
        });
      });
  });
  recursive(vrijedjalica);
})();

function recursive(vrijedjalica) {
  let majmuni = [];
  let socket = new WebSocket("wss://gateway.discord.gg/?v=6&encording=json");

  socket.onready = function (event) {
    console.log("Selfbot ready");
  };
  socket.onclose = async function (event) {
    recursive(vrijedjalica);
  };
  socket.onmessage = async function (event) {
    let ejson = JSON.parse(event.data);
    let e = JSON.stringify(event.data);

    let payload = {
      op: 2,
      d: {
        token: token,
        properties: {
          os: "TklHR0VSU1NTUyBJIEhBVEUgTklHR0VSUyBJIEhBVEUgVEhFTSBTTyBNVUNI",
        },
      },
    };
    async function hb(socket, interval) {
      while (true) {
        let hbpayload = {
          op: 1,
          d: "null",
        };
        socket.send(JSON.stringify(hbpayload));
        await sleep(interval);
      }
    }
    if (e.includes("heartbeat_interval")) {
      var interval = JSON.parse(event.data)["d"]["heartbeat_interval"];
      hb(socket, interval);
      socket.send(JSON.stringify(payload));
    }
    if (
      (ejson["t"] == "MESSAGE_CREATE" &&
        ejson["d"]["author"]["id"] == author) ||
      majmuni.includes(ejson?.d?.author?.id)
    ) {
      let ctx = ejson["d"]["content"];
      if (majmuni.includes(ejson?.d?.author?.id)) {
        sendmsg(
          (id = ejson?.d?.author?.id),
          (guid = ejson?.d?.channel_id),
          (arry = vrijedjalica),
          (message_id = ejson?.d?.id)
        );
        return;
      }
      if (
        ejson["d"]["author"]["id"] == author &&
        ejson["d"]["content"].startsWith("!vredjalica")
      ) {
        majmuni.push(ctx.replace(/<|@|>/g, "").split(" ")[1]);
      }
      if (
        ejson["d"]["author"]["id"] == author &&
        ejson["d"]["content"].startsWith("!stopvredjalica")
      ) {
        majmuni.pop(majmuni.indexOf(ctx.replace(/<|@|>/g, "").split(" ")[1]));
      }
    }
  };
}

function sendmsg(
  id = undefined,
  guild_id = undefined,
  arry = undefined,
  message_id = undefined
) {
  if (id == undefined || guild_id == undefined) return;
  var decodeHtmlEntity = function (str) {
    return str.replace(/&#(\d+);/g, function (match, dec) {
      return String.fromCharCode(dec);
    });
  };
  fetch(`https://discord.com/api/v9/channels/${guild_id}/messages`, {
    headers: {
      accept: "*/*",
      "accept-language": "en-US",
      authorization: token,
      "content-type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-debug-options": "bugReporterEnabled",
      "x-discord-locale": "en-GB",
      "x-super-properties":
        "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjEuMC45MDA1Iiwib3NfdmVyc2lvbiI6IjEwLjAuMjIwMDAiLCJvc19hcmNoIjoieDY0Iiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTQwNTc1LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
    },
    body: JSON.stringify({
      content: decodeHtmlEntity(arry[Math.floor(Math.random() * arry.length)]),
      message_reference: { message_id: message_id },
    }),
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}


function regexvrijedjanja(elem) {
  const regex = /(?<=<br \/>\n)(.*)(?=<\/p>)/gm;
  let m;
  let vrijedjalica = [];
  while ((m = regex.exec(elem)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    m.forEach((match, groupIndex) => {
      vrijedjalica.push(match);
    });
  }
  return vrijedjalica;
}
