'use strict';
/**
 * Copyright (C) Mulesoft.
 * Shared under Apache 2.0 license
 *
 * @author Pawel Psztyc
 */
const tmp = require('tmp');
const fs = require('fs-extra');

/**
 * A class responsible for performing basic operations on a source files
 * and build locations.
 */
class SourceControl {
  /**
   * Constructs the processor.
   *
   * @param {Winston} logger Logger to use to log debug output
   */
  constructor(logger) {
    /**
     * Working directory for the API Console.
     * It's set after calling `createWorkingDir()`
     * @type {String}
     */
    this.workingDir = undefined;
    /**
     * Logger to use to print output.
     *
     * @type {Object}
     */
    this.logger = logger;
  }

  /**
   * Creates a working directory where the files will be processed.
   *
   * The function sets `this.workingDir` property on this class object.
   *
   * @return {Promise} Resolved promise when the tmp dire was created with path
   * to the working directory.
   */
  createWorkingDir() {
    return this.createTempDir()
    .then(path => fs.realpath(path))
    .then(path => this.workingDir = path);
  }
  /**
   * Cleans up the temporaty directory.
   *
   * @param {String} dir Path to the temporaty directory.
   */
  cleanup(dir) {
    if (!dir) {
      return Promise.resolve();
    }
    this.logger.info('Cleaning up temporaty dir...');
    return fs.pathExists(dir)
    .then((exists) => {
      if (exists) {
        this.logger.info('Removing ', dir);
        return fs.remove(dir);
      }
    });
  }
  /**
   * Creates a temp working dir for the console.
   */
  createTempDir() {
    this.logger.info('Creating working directory...');
    return new Promise((resolve, reject) => {
      tmp.dir((err, _path) => {
        if (err) {
          reject(new Error('Unable to create a temp dir: ' + err.message));
          return;
        }
        this.logger.info('Working directory created: ', _path);
        resolve(_path);
      });
    });
  }
}

exports.SourceControl = SourceControl;
