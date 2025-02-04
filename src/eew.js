const utils = require("./utils/utils");

class eew {
    constructor(logger = null, config = {}) {
        this.eew = null;
        this.logger = logger;
        this.config = config;
        this.instance = this;
    }

    static getInstance() {
        if (!eew.instance) {
          new eew();
        }

        return eew.instance;
    }

    sendEew(ans) {
        const data = ans.data;
        const eq = { ...data.eq };

        const showtime = utils.formatTime(eq.time);

        let msg = "";

        msg = this.config.webhookeewinfo;
        msg = JSON.parse(msg);

        msg.username = "TREM-Lite | 臺灣即時地震監測",
        msg.avatar_url = "https://raw.githubusercontent.com/ExpTechTW/API/master/ExpTech.jpg",
        msg.embeds[0].author = {
            name : "TREM-Lite | 臺灣即時地震監測",
        };

        msg.embeds[0].image = {
            url : "",
        };
        msg.embeds[0].footer = {
        text     : `ExpTech Studio ${utils.formatTime(Date.now())}`,
        icon_url : "https://raw.githubusercontent.com/ExpTechTW/API/master/ExpTech.jpg",
        };
        msg.tts = this.config.ttsnotification;

        let Unit = "";

        if (data.author == "cwb")
        Unit = "中央氣象署 (CWA)";
        else if (data.author == "scdzj")
        Unit = "四川省地震局 (SCDZJ)";
        else if (data.author == "fjdzj")
        Unit = "福建省地震局 (FJDZJ)";
        else if (data.author == "nied")
        Unit = "防災科学技術研究所 (NIED)";
        else if (data.author == "jma")
        Unit = "気象庁(JMA)";
        else if (data.author == "kma")
        Unit = "기상청(KMA)";
        else if (data.author == "trem" && data.serial <= 3)
        Unit = "NSSPE(無震源參數推算)";
        else if (data.author == "trem" && data.serial > 3)
        Unit = "TREM(實驗功能僅供參考)";

        if (data.author == "trem" && data.serial <= 3) {
            eq.depth = "?";
            eq.mag = "?";
        }

        msg.content = this.config.ttsnotification ?
        (showtime + "左右發生顯著有感地震東經" + eq.lon + "北緯" + eq.lat + "位於" + eq.loc +
        "深度" + eq.depth + "公里" +
        "規模" + eq.mag +
        "第" + data.serial + "報發報單位" + Unit + "慎防強烈搖晃，就近避難 [趴下、掩護、穩住]") : "";

        msg = JSON.stringify(msg);

        msg = msg.replace("%Depth%", eq.depth)
        .replaceAll("%NorthLatitude%", eq.lat)
        .replace("%Time%", showtime)
        .replaceAll("%EastLongitude%", eq.lon)
        .replace("%location%", eq.loc).
        replace("%Scale%", eq.mag)
        .replace("%Number%", data.serial)
        .replace("%Final%", (data.final) ? "(最終報)" : "");

        if (data.author == "cwb")
        msg = msg.replace("%Provider%", "中央氣象署 (CWA)");
        else if (data.author == "scdzj")
        msg = msg.replace("%Provider%", "四川省地震局 (SCDZJ)");
        else if (data.author == "fjdzj")
        msg = msg.replace("%Provider%", "福建省地震局 (FJDZJ)");
        else if (data.author == "nied")
        msg = msg.replace("%Provider%", "防災科学技術研究所 (NIED)");
        else if (data.author == "jma")
        msg = msg.replace("%Provider%", "気象庁(JMA)");
        else if (data.author == "kma")
        msg = msg.replace("%Provider%", "기상청(KMA)");
        else if (data.author == "trem" && data.serial <= 3)
        msg = msg.replace("%Provider%", "NSSPE(無震源參數推算)");
        else if (data.author == "trem" && data.serial > 3)
        msg = msg.replace("%Provider%", "TREM(實驗功能僅供參考)");

        setTimeout(() => {
            if (this.config.webhookURL) {
                fetch(this.config.webhookURL, {
                    method  : "POST",
                    headers : { "Content-Type": "application/json" },
                    body    : msg,
                }).catch((error) => {
                    this.logger.error(error);
                });
                this.logger.info("Posting EEW Webhook");
            }
        }, 2000);
    }
}

new eew();

module.exports = eew;