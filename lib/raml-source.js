'use strict';
/**
 * Copyright (C) Mulesoft.
 * Shared under Apache 2.0 license
 *
 * @author Pawel Psztyc
 */
const {RamlJsonGenerator} = require('raml-json-enhance-node');

class RamlSource {
  constructor(logger) {
    this.logger = logger;
    this.raml = undefined;
  }
  /**
   * Gets a RAML definition from local or remote location and parses it to JSON with
   * RAML parser and `ram-json-enhance-node` module.
   *
   * @param {String} apiUrl Location of the RAML api file
   * @param {?String} outputDir A directory of where to put the `api.json` file. Optional.
   * @return {Promise} Resolved promise with parsed JavaScript object. Also sets `raml` property
   * on this object with the same value.
   */
  getRamlJson(apiUrl) {
    this.raml = undefined;
    if (!apiUrl) {
      this.logger.info('No RAML source. Skipping api parser.');
      return Promise.resolve();
    }

    this.logger.info('Getting the RAML data...');
    const enhancer = new RamlJsonGenerator(apiUrl);
    return enhancer.generate()
    .then((json) => {
      this.logger.info('RAML data ready');
      this.raml = json;
      return json;
    });
  }
}

exports.RamlSource = RamlSource;
