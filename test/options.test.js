'use strict';

const {PreviewOptions} = require('../lib/preview-options.js');
const assert = require('chai').assert;

describe('Options', () => {

  describe('validateOptions()', () => {
    var options;

    describe('_validateOptionsList()', () => {
      beforeEach(function() {
        options = new PreviewOptions();
      });

      it('Should pass a known options', function() {
        options._validateOptionsList({
          tagVersion: 'test',
          verbose: true,
          open: true,
          host: 'test-host',
          port: 12345,
          api: 'test.raml',
          projectRoot: 'test/',
          src: 'console-test/',
          sourceIsZip: true,
          noBower: false
        });
        assert.isTrue(options.isValid);
      });

      it('Should not pass a unknown option', function() {
        options._validateOptionsList({
          test: 'test'
        });
        assert.isFalse(options.isValid);
      });

      it('Should not pass invalid type', function() {
        options._validateOptionsList({
          tagVersion: true,
          verbose: 'true',
          open: 'true',
          host: 123,
          port: '12345',
          api: null,
          projectRoot: 'test/',
          src: 'console-test/',
          sourceIsZip: true,
          noBower: false
        });
        assert.isFalse(options.isValid);
      });
    });

    describe('_validateSourceOptions()', () => {
      beforeEach(function() {
        options = new PreviewOptions();
      });

      it('Should fail for src and tagVersion', function() {
        options._validateSourceOptions({
          src: 'test',
          tagVersion: 'v1'
        });
        assert.isFalse(options.isValid);
        assert.lengthOf(options.validationWarnings, 0);
      });

      it('Should want for sourceIsZip and src not set', function() {
        options._validateSourceOptions({
          sourceIsZip: true
        });
        assert.isTrue(options.isValid);
        assert.lengthOf(options.validationWarnings, 1);
      });

      it('Should want for sourceIsZip and tagVersion set', function() {
        options._validateSourceOptions({
          sourceIsZip: true,
          tagVersion: 'v1'
        });
        assert.isTrue(options.isValid);
        assert.lengthOf(options.validationWarnings, 2);
      });

      it('Passes valid src', function() {
        options._validateSourceOptions({
          src: 'test'
        });
        assert.isTrue(options.isValid);
        assert.lengthOf(options.validationWarnings, 0);
      });

      it('Passes valid tagVersion', function() {
        options._validateSourceOptions({
          tagVersion: 'test'
        });
        assert.isTrue(options.isValid);
        assert.lengthOf(options.validationWarnings, 0);
      });

      it('Passes valid src and sourceIsZip', function() {
        options._validateSourceOptions({
          src: 'test',
          sourceIsZip: true
        });
        assert.isTrue(options.isValid);
        assert.lengthOf(options.validationWarnings, 0);
      });
    });
  });
  describe('Default options', () => {
    var options;

    before(function() {
      options = new PreviewOptions();
    });

    it('Should not set src default option', function() {
      assert.isUndefined(options.src);
    });

    it('Should set sourceIsZip default option', function() {
      assert.isFalse(options.sourceIsZip);
    });

    it('Should set verbose default option', function() {
      assert.isFalse(options.verbose);
    });

    it('Should set open default option', function() {
      assert.isFalse(options.open);
    });

    it('Should set host default option', function() {
      assert.isUndefined(options.host);
    });

    it('Should set port default option', function() {
      assert.equal(options.port, 0);
    });

    it('Should set api default option', function() {
      assert.equal(options.api, 'api.raml');
    });

    it('Should set projectRoot default option', function() {
      assert.typeOf(options.projectRoot, 'string');
    });

    it('ProjectRoot is an absolute path', function() {
      assert.equal(options.projectRoot[0], '/');
    });

    it('Should set sourceIsZip default option', function() {
      assert.isFalse(options.sourceIsZip);
    });

    it('Should set noBower default option', function() {
      assert.isFalse(options.noBower);
    });

    it('Should set tagVersion default option', function() {
      assert.isUndefined(options.tagVersion);
    });
  });
});
