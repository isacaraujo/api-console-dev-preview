'use strict';
/**
 * Copyright (C) Mulesoft.
 * Shared under Apache 2.0 license
 *
 * @author Pawel Psztyc <pawel.psztyc@mulesoft.com>
 */
const path = require('path');
/**
 * Options object for the ApiConsoleDevPreview class.
 */
class PreviewOptions {
  constructor(opts) {
    opts = opts || {};

    this.validateOptions(opts);
    if (!this.isValid) {
      return;
    }

    opts = this._setDefaults(opts);

    /**
     * Optional. Prints verbose output. Default to `false`.
     * @type {Boolean}
     */
    this.verbose = opts.verbose;
    /**
     * Optional. If set it opens browser window when console is ready. Default to `false`.
     * @type {Boolean}
     */
    this.open = opts.open;
    /**
     * Optional. Host name to create server.
     * @type {String}
     */
    this.host = opts.host;
    /**
     * Port number to run the console at.
     * @type {Number}
     */
    this.port = opts.port;
    /**
     * The RAML api entry point.
     * @type {String}
     */
    this.api = opts.api;
    /**
     * API project folder location.
     * Default to current working directory.
     * @type {String}
     */
    this.projectRoot = opts.projectRoot;
    /**
     * API console sources in local or remote location.
     * If sources are at remote location it must be zip file.
     * @type {String}
     */
    this.src = opts.src;
    /**
     * Determines that local API console source is in zip file.
     * @type {Boolean}
     */
    this.sourceIsZip = opts.sourceIsZip;
    /**
     * A release tag name to use. With this option the builder uses specific
     * release of the console. If not set and `src` is not set it uses latest
     * release. Note, only versions >= 4.0.0 can be used with this tool.
     */
    this.tagVersion = opts.tagVersion;
    /**
     * If set then the module do not installs bower components.
     * This assumes that the `src` is set and point to a location with
     * the API console with all dependencies already installed.
     *
     * Use this option to speed up the startup.
     * @type {Boolean}
     */
    this.noBower = opts.noBower;
  }

  get validOptions() {
    return {
      'api': String,
      'port': Number,
      'host': String,
      'open': Boolean,
      'src': String,
      'sourceIsZip': Boolean,
      'tagVersion': String,
      'projectRoot': String,
      'noBower': Boolean,
      'verbose': Boolean
    };
  }

  get isValid() {
    return this.validationErrors.length === 0;
  }

  _setDefaults(opts) {
    if (!('api' in opts)) {
      opts.api = 'api.raml';
    }
    if (!('projectRoot' in opts)) {
      opts.projectRoot = process.cwd();
    } else if (opts.projectRoot.indexOf('/') !== 0) {
      // Required for the watch task
      opts.projectRoot = path.resolve(opts.projectRoot);
    }
    opts.open = typeof opts.open === 'boolean' ? opts.open : false;
    opts.verbose = typeof opts.verbose === 'boolean' ? opts.verbose : false;
    opts.sourceIsZip = typeof opts.sourceIsZip === 'boolean' ? opts.sourceIsZip : false;
    opts.host = typeof opts.host === 'string' ? opts.host : false;
    opts.port = typeof opts.port === 'number' ? opts.port : false;
    opts.src = typeof opts.src === 'string' ? opts.src : false;
    opts.tagVersion = typeof opts.tagVersion === 'string' ? opts.tagVersion : false;
    opts.noBower = typeof opts.noBower === 'boolean' ? opts.noBower : false;
    return opts;
  }

  /**
   * Validates user input options.
   * Sets `_validationErrors` and `_validationWarnings` arrays on this object
   * containing corresponing messages.
   *
   * @param {Object} userOpts User options to check.
   */
  validateOptions(userOpts) {
    this.validationErrors = [];
    this.validationWarnings = [];

    this._validateOptionsList(userOpts);
  }

  _validateOptionsList(userOpts) {
    var keys = Object.keys(userOpts);
    var known = this.validOptions;
    var knownKeys = Object.keys(known);
    var unknown = [];
    var invalid = [];

    keys.forEach(property => {
      if (knownKeys.indexOf(property) === -1) {
        unknown.push(property);
        return;
      }
      var type = known[property];
      if (!this._validType(userOpts[property], type)) {
        invalid.push({
          property: property,
          expected: type,
          given: typeof userOpts[property]
        });
      }
    });

    if (unknown.length) {
      let message = 'Unknown option';
      if (unknown.length > 1) {
        message += 's';
      }
      message += ': ' + unknown.join(', ');
      this.validationErrors.push(message);
    }

    if (invalid.length) {
      invalid.forEach(error => {
        let message = 'Expecting ' + error.expected.name + ' for property ';
        message += error.property + ' but ' + error.given + ' was given.';
        this.validationErrors.push(message);
      });
    }
  }

  _validType(input, expected) {
    if (input instanceof Array && expected === Array) {
      return true;
    }
    if (Object(input) === input && expected === Object) {
      return true;
    }
    var type = expected.name;
    type = type ? type.toLowerCase() : undefined;
    if (typeof input === type) {
      return true;
    }
    return false;
  }
}
exports.PreviewOptions = PreviewOptions;
