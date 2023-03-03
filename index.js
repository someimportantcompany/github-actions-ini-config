/**
 * @author: jdrydn <james@jdrydn.com> (https://github.com/jdrydn)
 * @license: MIT
 * @link: https://github.com/someimportantcompany/github-actions-ini-config
 * @variation: 3c1b552680fe
 */
const core = require('@actions/core');
const { parse } = require('ini');

module.exports = function run() {
  try {
    const raw = core.getInput('config', { required: true });
    const config = parse(raw);
    core.debug(JSON.stringify(config));

    const { env, outputs } = Object.entries(config).reduce((final, [ key, opts ]) => {
      if (key === '(true)') {
        Object.assign(final, opts);
      }
      return final;
    }, {
      env: config.env || {},
      outputs: config.outputs || {},
    });

    core.debug(JSON.stringify({ env, outputs }));

    if (env) {
      for (const [key, value] of Object.entries(env)) {
        core.exportVariable(key.toUpperCase(), value);
        core.info(`export ${key.toUpperCase()}=${value}`);
      }
    }
    if (outputs) {
      for (const [key, value] of Object.entries(outputs)) {
        core.setOutput(key, value);
        core.info(`outputs.${key} = ${value}`);
      }
    }
  } catch (err) {
    core.setFailed(err.message);
  }
};

/* istanbul ignore next */
if (require.main === module) {
  module.exports();
}
