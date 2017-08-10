'use strict';

const {RamlSource} = require('../lib/raml-source');
const assert = require('chai').assert;

describe('RAML source', () => {
  const logger = {
    warn: function() {
      // console.info.apply(console, arguments);
    },
    info: function() {
      // console.info.apply(console, arguments);
    },
    log: function() {
      // console.info.apply(console, arguments);
    },
    error: function() {
      // console.info.apply(console, arguments);
    }
  };
  var processor;
  before(function() {
    processor = new RamlSource(logger);
  });

  describe('getRamlJson()', function() {
    it('Quietly resolves undefined when path is not set', function() {
      return processor.getRamlJson()
      .then(content => assert.isUndefined(content));
    });

    it('Returns with parsed RAML', function() {
      this.timeout(15000);
      return processor.getRamlJson('test/api/api.raml')
      .then((result) => {
        assert.typeOf(result, 'object', 'the result is object');
        assert.isString(result.title, 'result.title is string');
      });
    });
  });
});
