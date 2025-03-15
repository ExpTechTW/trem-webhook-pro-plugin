const config = require("../config/config");
const eew = require("./src/eew");
const intensity = require("./src/intensity");
const report = require("./src/report");

class Plugin {
  #ctx;
  #config;
  #report;
  #eew;
  #intensity;

  constructor(ctx) {
    this.#ctx = ctx;
    this.#config = null;
    this.#report = null;
    this.#eew = null;
    this.#intensity = null;
    this.config = {};
  }

  onLoad() {
    const { TREM, Logger, info, utils, MixinManager } = this.#ctx;

    const { CustomLogger } =
      require("./src/utils/logger").createCustomLogger(Logger);
    this.logger = new CustomLogger("webhook-pro");

    const defaultDir = utils.path.join(info.pluginDir, "./webhook-pro/resource/default.yml");
    const configDir = utils.path.join(info.pluginDir, "./webhook-pro/config.yml");

    this.#config = new config("webhook-pro", this.logger, utils.fs, defaultDir, configDir);
    this.config = this.#config.getConfig();

    this.#report = new report(this.logger, this.config);
    this.#eew = new eew(this.logger, this.config);
    this.#intensity = new intensity(this.logger, this.config);

    logger.info("Loading webhook-pro plugin...");

    const event = (event, callback) => TREM.variable.events.on(event, callback);

    event("ReportRelease", (ans) => {
      this.#report.sendReport(ans);
    });

    event("EewRelease", (ans) => {
      this.#eew.sendEew(ans);
    });

    event("EewUpdate", (ans) => {
      this.#eew.sendEew(ans);
    });

    event('IntensityRelease', (ans) => {
      this.#intensity.sendIntensity(ans);
    });
    event('IntensityUpdate', (ans) => {
      this.#intensity.sendIntensity(ans);
    });
  }
}

module.exports = Plugin;
