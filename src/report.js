const utils = require("./utils/utils");

const intensity_list = ["0", "1", "2", "3", "4", "5⁻", "5⁺", "6⁻", "6⁺", "7"];
const intensity_icon = ["⚫", "⚪", "🟢", "🟡", "🟠", "🟠", "🔴", "🟤", "🟣", "🟪"];

class report {
    constructor(logger = null, config = {}) {
        this.report = null;
        this.logger = logger;
        this.config = config;
        this.instance = this;
    }

    static getInstance() {
        if (!report.instance) {
          new report();
        }

        return report.instance;
    }

    Report_GET_Max(report) {
        let Max_Level = 0;
        let Max_Level_areaName = "";
        let Max_Level_stationName = "";
        let Max_Level_distance = Number.POSITIVE_INFINITY;
        let info_msg = "";

        const intensityData = {};

        if (report.list) {
            for (let index = 0, keys = Object.keys(report.list), n = keys.length; index < n; index++) {
                const areaName = keys[index];

                if (Max_Level < report.list[areaName].int) {
                    Max_Level = report.list[areaName].int;
                    Max_Level_areaName = areaName;
                    Max_Level_distance = Number.POSITIVE_INFINITY;
                }

                for (let station_index = 0, station_keys = Object.keys(report.list[areaName].town), o = station_keys.length; station_index < o; station_index++) {
                    const station_name = station_keys[station_index];
                    const station_temp = report.list[areaName].town[station_name];
                    const distance = utils.twoPointDistance(
                        { lat: report.lat, lon: report.lon },
                        { lat: station_temp.lat, lon: station_temp.lon },
                    ).toFixed(2);
                    report.list[areaName].town[station_name].distance = distance;

                    if (Max_Level_distance > parseFloat(distance))
                        if (Max_Level_areaName === areaName) {
                            if (Max_Level === station_temp.int) {
                                Max_Level_stationName = station_name;
                                Max_Level_distance = parseFloat(distance);
                            }
                        } else if (Max_Level === station_temp.int) {
                            Max_Level_areaName = areaName;
                            Max_Level_stationName = station_name;
                            Max_Level_distance = parseFloat(distance);
                        }

                    if (!intensityData[station_temp.int])
                        intensityData[station_temp.int] = {};
                    if (!intensityData[station_temp.int][areaName])
                        intensityData[station_temp.int][areaName] = [];
                    intensityData[station_temp.int][areaName].push(station_name);
                }
            }

            const sortedIntensities = Object.keys(intensityData).sort((a, b) => b - a);
            sortedIntensities.forEach((intensity) => {
                const cityGroups = intensityData[intensity];
                let intensityLabel = intensity_list[intensity];
                intensityLabel = intensityLabel.includes("⁺") || intensityLabel.includes("⁻")
                ? intensityLabel.replace("⁺", "強").replace("⁻", "弱")
                : intensityLabel;
                const cityMessages = Object.keys(cityGroups).map((city) => `${city}(${cityGroups[city].join("、")})`).join("\n");
                info_msg += `[${intensity ? intensity_icon[intensity] : ""}震度${intensityLabel}]\n${cityMessages}\n\n`;
            });

            report.info_msg = info_msg;
            report.Max_Level = Max_Level;
            report.Max_Level_areaName = Max_Level_areaName;
            report.Max_Level_stationName = Max_Level_stationName;
        }

        return report;
    }

    IntensityI(Intensity) {
        return Intensity == 5 ? "5-"
            : Intensity == 6 ? "5+"
                : Intensity == 7 ? "6-"
                    : Intensity == 8 ? "6+"
                        : Intensity == 9 ? "7"
                            : Intensity ?? "--";
    }

    sendReport(ans) {
        let data = ans.data;
        const report_list_length = Object.keys(data.list).length;

        data = this.Report_GET_Max(data);

        data.no = data.id.split("-")[0];

        let msg = {};
        msg = {
            username   : "TREM-Lite | 臺灣即時地震監測",
            avatar_url : "https://raw.githubusercontent.com/ExpTechTW/API/master/ExpTech.jpg",
            tts        : this.config.ttsnotification,
            content    : this.config.ttsnotification ?
            ("地震報告"
            + ((report_list_length != 0) ? "發生規模" + data.mag + "有感地震，最大震度" + data.Max_Level_areaName + data.Max_Level_stationName + this.IntensityI(data.Max_Level) + "級。" : "發生規模" + data.mag + "有感地震 ")
            + "編號"
            + (data.no % 1000 ? data.no : "無（小區域有感地震）")
            + "時間"
            + utils.formatTime(new Date(data.time))
            + "深度"
            + data.depth + " 公里"
            + "震央位置"
            + "經度 東經 " + data.lon + "緯度 北緯 " + data.lat + "即在" + data.loc
            + ((report_list_length != 0) ? "最大震度" + this.IntensityI(data.Max_Level) + "級地區" : "")
            + ((report_list_length != 0) ? data.Max_Level_areaName : "")) : "",
            embeds  : [
                {
                    author: {
                        name     : "TREM-Lite | 臺灣即時地震監測",
                        url      : undefined,
                        icon_url : undefined,
                    },
                    description : (report_list_length != 0) ? "發生規模" + data.mag + "有感地震，最大震度" + data.Max_Level_areaName + data.Max_Level_stationName + this.IntensityI(data.Max_Level) + "級。" : "發生規模" + data.mag + "有感地震",
                    fields      : [
                        {
                            name   : "編號",
                            value  : data.no % 1000 ? data.no : "無（小區域有感地震）",
                            inline : true,
                        },
                        {
                            name   : "時間",
                            value  : utils.formatTime(new Date(data.time)),
                            inline : true,
                        },
                        {
                            name   : "深度",
                            value  : data.depth + " 公里",
                            inline : true,
                        },
                        {
                            name   : "震央位置",
                            value  : "> 經度 **東經 " + data.lon + "**\n> 緯度 **北緯 " + data.lat + "**\n> 即在 **" + data.loc + "**",
                            inline : false,
                        },
                        {
                            name   : (report_list_length != 0) ? "最大震度" + this.IntensityI(data.Max_Level) + "級地區" : "",
                            value  : (report_list_length != 0) ? data.Max_Level_areaName : "",
                            inline : false,
                        },
                        {
                            name   : "各地震度",
                            value  : data.info_msg,
                            inline : false,
                          },
                        {
                            name   : "地圖",
                            value  : "https://www.google.com/maps/search/?api=1&query=" + data.lat + "," + data.lon,
                            inline : true,
                        },
                    ],
                    color : data.no % 1000 ? 15158332 : 3066993,
                    image : {
                        url : "",
                    },
                    footer : {
                        text     : `ExpTech Studio ${utils.formatTime(Date.now())}`,
                        icon_url : "https://raw.githubusercontent.com/ExpTechTW/API/master/ExpTech.jpg",
                    },
                },
            ],
        };
        if (this.config.webhookURL) {
            fetch(this.config.webhookURL, {
                method  : "POST",
                headers : { "Content-Type": "application/json" },
                body    : JSON.stringify(msg),
            }).catch((error) => {
                this.logger.error(error);
            });
            this.logger.info("Posting Report Webhook");
        }
    }
}

new report();

module.exports = report;