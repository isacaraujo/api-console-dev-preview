'use strict';

const {ApiConsoleDevPreview} = require('../lib/dev-preview');
const assert = require('chai').assert;
const fs = require('fs-extra');
const path = require('path');

describe('Dev preview', () => {

  var processor;

  describe('Constructor', function() {

    it('Throws an error for invalid options', function() {
      assert.throws(function() {
        new ApiConsoleDevPreview({
          test: true
        });
      });
    });

    it('Do not throws an error for valid options', function() {
      assert.doesNotThrow(function() {
        new ApiConsoleDevPreview({
          api: 'test'
        });
      });
    });

    it('Sets an option object', function() {
      processor = new ApiConsoleDevPreview({
        api: 'test'
      });
      assert.typeOf(processor.opts, 'object');
    });

    it('Sets __exitHandler property', function() {
      processor = new ApiConsoleDevPreview({
        api: 'test'
      });
      assert.typeOf(processor.__exitHandler, 'function');
    });

    it('Sets the logger', function() {
      processor = new ApiConsoleDevPreview({
        api: 'test'
      });
      assert.typeOf(processor.logger, 'object');
    });
  });

  describe('printValidationErrors()', function() {
    it('Prints validation error to the logger.error', function() {
      var calledCount = 0;
      const logger = {
        error: function() {
          calledCount++;
        },
        info: function() {}
      };
      processor = new ApiConsoleDevPreview({
        api: 'test'
      });
      processor.logger = logger;
      processor.opts.validationErrors = ['test'];
      processor.printValidationErrors();
      assert.equal(calledCount, 1);
    });
  });

  describe('printValidationWarnings()', function() {
    it('Prints validation error to the logger.error', function() {
      var calledCount = 0;
      const logger = {
        warn: function() {
          calledCount++;
        },
        info: function() {}
      };
      processor = new ApiConsoleDevPreview({
        api: 'test'
      });
      processor.logger = logger;
      processor.opts.validationWarnings = ['test'];
      processor.printValidationWarnings();
      assert.equal(calledCount, 1);
    });
  });

  describe('Getters', function() {
    before(function() {
      processor = new ApiConsoleDevPreview();
    });

    it('Returns sourceControl', function() {
      assert.equal(processor.sourceControl.constructor.name, 'SourceControl');
    });

    it('sourceControl is the same object each time called', function() {
      var t1 = processor.sourceControl;
      var t2 = processor.sourceControl;
      assert.isTrue(t1 === t2);
    });

    it('Returns templatesProcessor', function() {
      processor.sourceControl.workingDir = 'test';
      assert.equal(processor.templatesProcessor.constructor.name, 'ApiConsoleTemplatesProcessor');
    });

    it('templatesProcessor is the same object each time called', function() {
      processor.sourceControl.workingDir = 'test';
      var t1 = processor.templatesProcessor;
      var t2 = processor.templatesProcessor;
      assert.isTrue(t1 === t2);
    });

    it('Returns consoleSources', function() {
      assert.equal(processor.consoleSources.constructor.name, 'ApiConsoleSources');
    });

    it('consoleSources is the same object each time called', function() {
      var t1 = processor.consoleSources;
      var t2 = processor.consoleSources;
      assert.isTrue(t1 === t2);
    });

    it('Returns dataProvider', function() {
      assert.equal(processor.dataProvider.constructor.name, 'RamlJsDataProvider');
    });

    it('dataProvider is the same object each time called', function() {
      var t1 = processor.dataProvider;
      var t2 = processor.dataProvider;
      assert.isTrue(t1 === t2);
    });
  });

  describe('_sourcesProcessorOptions()', function() {
    before(function() {
      processor = new ApiConsoleDevPreview();
    });

    it('Returns an object', function() {
      assert.typeOf(processor._sourcesProcessorOptions(), 'object');
    });

    it('Sets tagVersion option', function() {
      processor.opts.tagVersion = '123';
      var result = processor._sourcesProcessorOptions();
      assert.equal(result.tagVersion, processor.opts.tagVersion);
    });

    it('Sets src option', function() {
      processor.opts.src = 'test';
      var result = processor._sourcesProcessorOptions();
      assert.equal(result.src, processor.opts.src);
    });

    it('Sets sourceIsZip option', function() {
      processor.opts.sourceIsZip = false;
      var result = processor._sourcesProcessorOptions();
      assert.equal(result.sourceIsZip, processor.opts.sourceIsZip);
    });
  });

  describe('_sourcesToWorkingDirectory()', function() {
    describe('Zip file', function() {
      this.timeout(15000);
      const options = {
        src: 'test/api-console-installed.zip',
        sourceIsZip: true
      };
      var workingDir;
      before(function() {
        processor = new ApiConsoleDevPreview(options);
        return processor._sourcesToWorkingDirectory()
        .then(() => {
          workingDir = processor.sourceControl.workingDir;
        });
      });

      it('Creates temp dir', function() {
        return fs.pathExists(workingDir)
        .then(exists => assert.isTrue(exists));
      });

      it('Copies console files into the dir', function() {
        return fs.pathExists(path.join(workingDir, 'api-console.html'))
        .then(exists => assert.isTrue(exists));
      });

      it('Copies bower_components dir', function() {
        return fs.pathExists(path.join(workingDir, 'bower_components'))
        .then(exists => assert.isTrue(exists));
      });
    });

    describe('Tagged release', function() {
      this.timeout(30000);
      const options = {
        tagVersion: 'v4.0.0'
      };
      var workingDir;
      before(function() {
        processor = new ApiConsoleDevPreview(options);
        return processor._sourcesToWorkingDirectory()
        .then(() => {
          workingDir = processor.sourceControl.workingDir;
        });
      });

      it('Copies console files into the dir', function() {
        return fs.pathExists(path.join(workingDir, 'api-console.html'))
        .then(exists => assert.isTrue(exists));
      });

      it('Does not creates bower_components dir', function() {
        return fs.pathExists(path.join(workingDir, 'bower_components'))
        .then(exists => assert.isFalse(exists));
      });
    });

    describe('Latest release', function() {
      this.timeout(30000);
      const options = {
      };
      var workingDir;
      before(function() {
        processor = new ApiConsoleDevPreview(options);
        return processor._sourcesToWorkingDirectory()
        .then(() => {
          workingDir = processor.sourceControl.workingDir;
        });
      });

      it('Copies console files into the dir', function() {
        return fs.pathExists(path.join(workingDir, 'api-console.html'))
        .then(exists => assert.isTrue(exists));
      });

      it('Does not creates bower_components dir', function() {
        return fs.pathExists(path.join(workingDir, 'bower_components'))
        .then(exists => assert.isFalse(exists));
      });
    });
  });

  describe('_createDepenencyManagerOptions()', function() {
    before(function() {
      processor = new ApiConsoleDevPreview({});
    });

    it('Creates an object', function() {
      assert.typeOf(processor._createDepenencyManagerOptions(), 'object');
    });

    it('Sets verbose option', function() {
      processor.opts.verbose = false;
      var result = processor._createDepenencyManagerOptions();
      assert.isFalse(result.verbose);
    });
  });

  describe('_manageDependencies()', function() {
    this.timeout(30000);
    const options = {
      src: 'test/api-console-master.zip',
      sourceIsZip: true
    };
    var workingDir;
    before(function(done) {
      processor = new ApiConsoleDevPreview(options);
      processor._sourcesToWorkingDirectory()
      .then(() => {
        workingDir = processor.sourceControl.workingDir;
        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('Installs dependencies', function(done) {
      processor._manageDependencies()
      .then(() => {
        return fs.pathExists(path.join(workingDir, 'bower_components'));
      })
      .then(exists => assert.isTrue(exists, 'bower_components exists'))
      .then(() => {
        return fs.pathExists(path.join(workingDir, 'bower_components',
          'api-console', 'api-console.html'));
      })
      .then(exists => assert.isTrue(exists, 'Copies api-console.html to bower_components'))
      .then(() => done())
      .catch(e => {
        done(e);
      });
    });

    it('Skips dependencies for noBower option', function() {
      processor.opts.noBower = true;
      return processor._manageDependencies()
      .then(() => {
        return fs.pathExists(path.join(workingDir, 'bower_components',
          'api-console', 'api-console.html'));
      })
      .then(exists => assert.isTrue(exists, 'Copies api-console.html to bower_components'));
    });
  });

  describe('_prebuildTemplates()', function() {
    this.timeout(30000);
    const options = {
      src: 'test/api-console-installed.zip',
      sourceIsZip: true,
      noBower: true
    };
    var workingDir;
    before(function(done) {
      processor = new ApiConsoleDevPreview(options);
      processor._sourcesToWorkingDirectory()
      .then(() => {
        workingDir = processor.sourceControl.workingDir;
        return processor._manageDependencies();
      })
      .then(() => {
        done();
      })
      .catch(e => {
        done(e);
      });
    });

    it('Copy template file', function() {
      return processor._prebuildTemplates()
      .then(() => {
        return fs.pathExists(path.join(workingDir, 'index.html'));
      })
      .then(exists => assert.isTrue(exists, 'index.html exists'))
      .then(() => {
        return fs.readFile(path.join(workingDir, 'index.html'), 'utf8');
      })
      .then(content => {
        let index = content.indexOf('bower_components/api-console/api-console.html');
        assert.isAbove(index, 0, 'Template paths are rewrited');
      });
    });
  });
});
