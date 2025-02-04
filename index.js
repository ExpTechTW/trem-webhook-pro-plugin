const config = require("../config/config");
const eew = require("./src/eew");
const report = require("./src/report");

class Plugin {
  #ctx;
  #config;
  #eew;
  #report;

  constructor(ctx) {
    this.#ctx = ctx;
    this.#config = null;
    this.#eew = null;
    this.#report = null;
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

    this.#eew = new eew(this.logger, this.config);
    this.#report = new report(this.logger, this.config);

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
  }
}

module.exports = Plugin;
