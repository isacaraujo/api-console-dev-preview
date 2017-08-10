'use strict';

const {SourceControl} = require('../lib/source-control');
const assert = require('chai').assert;
const fs = require('fs-extra');
const path = require('path');

describe('SourceControl', () => {
  const logger = {
    warn: function() {
      // console.warn.apply(console, arguments);
    },
    info: function() {
      // console.info.apply(console, arguments);
    },
    log: function() {
      // console.log.apply(console, arguments);
    }
  };

  describe('createWorkingDir()', () => {
    var processor;
    beforeEach(function() {
      processor = new SourceControl(logger);
    });

    it('Creates a temporary location', function() {
      return processor.createWorkingDir()
      .then(path => {
        assert.isString(path);
        return path;
      })
      .then(path => processor.cleanup(path));
    });

    // This is important for Polymer Builder.
    it('Temporary location is not a symbolic link', function() {
      var _path;
      return processor.createWorkingDir()
      .then(p => {
        _path = p;
        return fs.stat(_path);
      })
      .then(stats => {
        assert.isFalse(stats.isSymbolicLink());
      })
      .then(() => processor.cleanup(_path));
    });
  });

  describe('cleanup()', () => {
    var processor;
    beforeEach(function() {
      processor = new SourceControl(logger);
    });

    it('Clears temportary location with files', function() {
      var _path;
      return processor.createWorkingDir()
      .then(_p => {
        _path = _p;
        return fs.writeFile(path.join(_p, 'test.log'), 'test', 'utf8');
      })
      .then(() => processor.cleanup(_path))
      .then(() => {
        return fs.pathExists(_path);
      })
      .then((result) => {
        assert.isFalse(result);
      });
    });
  });
});
