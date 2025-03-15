const utils = require("./utils/utils");
const regionV2 = require("../resource/region_v2.json");

class intensity {
    constructor(logger = null, config = {}) {
        this.intensity = null;
        this.logger = logger;
        this.config = config;
        this.instance = this;
    }

    static getInstance() {
        if (!intensity.instance) {
          new intensity();
        }

        return intensity.instance;
    }

    // #region Number >> Intensity
    IntensityI(Intensity) {
        return Intensity == 5 ? "5-"
            : Intensity == 6 ? "5+"
                : Intensity == 7 ? "6-"
                    : Intensity == 8 ? "6+"
                        : Intensity == 9 ? "7"
                            : Intensity ?? "--";
    }

    sendIntensity(ans) {
        const data = ans.data;
        // console.log(data);
        const max_intensity = `${this.IntensityI(data.max)}級`;
        const area = data.area;

        // const showtime = utils.formatTime(data.id);

        let description = "";
        let city0 = "";
        const areaKeys = Object.keys(area).reverse();

        for (let index = 0; index < areaKeys.length; index++) {
            const intensity0 = Number(Object.keys(area)[(areaKeys.length - (1 + index))]);
            const ids = area[areaKeys[index]];
            const intensity1 = `${this.IntensityI(intensity0)}級`;

            description += `${intensity1.replace("-級", "弱").replace("+級", "強")}\n`;

            for (const city in regionV2)
                for (const town in regionV2[city]) {
                    const loc = regionV2[city][town];

                    for (const id of ids)
                        if (loc.code == id && city0 == city) {
                            description += ` ${town}`;
                        } else if (loc.code == id && city0 == "") {
                            description += `${city} ${town}`;
                            city0 = city;
                        } else if (loc.code == id && city0 != city) {
                            description += `\n${city} ${town}`;
                            city0 = city;
                        }
                }

            if (city0 == "") continue;
            city0 = "";
            description += "\n";
        }

        description += "\n";

        let Unit = "";

        if (data.author == "cwa")
            Unit = "中央氣象署 (CWA)";
        else if (data.author == "trem")
            Unit = "TREM(震度速報僅供參考)";

		let msg = {
			username   : "TREM-Lite | 臺灣即時地震監測",
			avatar_url : "https://raw.githubusercontent.com/ExpTechTW/API/master/ExpTech.jpg",
			content    : this.config.ttsnotification ? ("震度速報"
			+ "資料來源" + Unit
			+ "第" + `${data.serial ?? "1"}報`
			+ ((data.final) ? "最終報" : "")
			+ "最大震度" + max_intensity.replace("-級", "弱").replace("+級", "強")) : "震度速報",
			tts    : this.config.ttsnotification,
			embeds : [
				{
					author: {
						name     : "TREM-Lite | 臺灣即時地震監測 震度速報",
						url      : undefined,
						icon_url : undefined,
					},
					fields: [
						{
							name   : "資料來源",
							value  : Unit,
							inline : true,
						},
                        {
							name   : "資料時間",
							value  : utils.formatTime(data.id),
							inline : true,
						},
						{
							name   : `第${data.serial ?? "1"}報`,
							value  : "",
							inline : false,
						},
						{
							name   : (data.final) ? "最終報" : "",
							value  : "",
							inline : true,
						},
						{
							name   : "最大震度",
							value  : max_intensity.replace("-級", "弱").replace("+級", "強"),
							inline : false,
						},
						{
							name   : "震度分布",
							value  : description,
							inline : true,
						},
					],
                    footer: {
                        text     : `ExpTech Studio ${utils.formatTime(Date.now())}`,
                        icon_url : "https://raw.githubusercontent.com/ExpTechTW/API/master/ExpTech.jpg",
                    }
				},
			],
		};

        msg = JSON.stringify(msg);

        setTimeout(() => {
            if (this.config.webhookURL) {
                fetch(this.config.webhookURL, {
                    method  : "POST",
                    headers : { "Content-Type": "application/json" },
                    body    : msg,
                }).catch((error) => {
                    this.logger.error(error);
                });
                this.logger.info("Posting intensity Webhook");
            }
        }, 2000);
    }
}

new intensity();

module.exports = intensity;