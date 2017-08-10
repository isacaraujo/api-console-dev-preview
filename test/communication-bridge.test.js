'use strict';

const {CommunicationBridge} = require('../lib/communication');
const assert = require('chai').assert;
const fs = require('fs-extra');
const babel = require('babel-core');

describe('Communication bridge', () => {
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
  var bridge;
  const PORT = 54321;
  const HOST = 'localhost';
  before(function() {
    bridge = new CommunicationBridge(HOST, PORT, logger);
  });

  describe('_getScriptContent()', function() {
    it('_readInjectScript() reads template file', function() {
      return bridge._readInjectScript()
      .then(content => assert.typeOf(content, 'string'));
    });

    it('_injectScriptBootstrap() adds script init to the script', function() {
      var content = 'abc';
      content = bridge._injectScriptBootstrap(content);

      assert.isAbove(content.indexOf(HOST), 4);
      assert.isAbove(content.indexOf(PORT), 4);
    });

    it('_injectScriptBootstrap() produces valid output', function() {
      var content = 'var abc;';
      content = bridge._injectScriptBootstrap(content);
      babel.transform(content, {
        ast: false,
        babelrc: false,
        comments: false,
        presets: ['env']
      });
      assert.isAbove(content.indexOf(HOST), 4);
      assert.isAbove(content.indexOf(PORT), 4);
    });

    it('_babelifyScript() never throws error', function() {
      const content = 'function test() { var aaa = "";';
      // Normally this would throw an error
      const result = bridge._babelifyScript(content);
      assert.equal(content, result);
    });

    it('_getScriptContent() return script string', function() {
      return bridge._getScriptContent()
      .then(content => assert.typeOf(content, 'string'));
    });
  });

  describe('_createScriptText()', function() {
    var node;
    const PARENT = 'TEST_PARENT';
    before(function() {
      return bridge._createScriptText(PARENT)
      .then(def => node = def);
    });

    it('Generated node is an object', function() {
      assert.typeOf(node, 'object');
    });

    it('Node type is text', function() {
      assert.equal(node.nodeName, '#text');
    });

    it('Containes text value', function() {
      assert.typeOf(node.value, 'string');
    });

    it('Parent node is set to the argument', function() {
      assert.equal(node.parentNode, PARENT);
    });
  });

  describe('_createScriptNode()', function() {
    var node;
    const PARENT = 'TEST_PARENT';
    before(function() {
      return bridge._createScriptNode(PARENT)
      .then(def => node = def);
    });

    it('Generated node is an object', function() {
      assert.typeOf(node, 'object');
    });

    it('Has no attributes', function() {
      assert.lengthOf(node.attrs, 0);
    });

    it('Has namespaceURI set', function() {
      assert.ok(node.namespaceURI);
    });

    it('Node name is script', function() {
      assert.equal(node.nodeName, 'script');
    });

    it('Node tagName is script', function() {
      assert.equal(node.tagName, 'script');
    });

    it('Parent node is set to the argument', function() {
      assert.equal(node.parentNode, PARENT);
    });

    it('Has one child', function() {
      assert.lengthOf(node.childNodes, 1);
    });
  });

  describe('inject()', function() {
    const TMPFILE = 'test/tmp_inject-script.html';
    before(function() {
      return fs.copy('test/communication-script-template.html', TMPFILE)
      .then(() => bridge.inject(TMPFILE));
    });

    after(function() {
      return fs.remove(TMPFILE);
    });

    it('File exists', function() {
      return fs.pathExists(TMPFILE)
      .then(exists => assert.isTrue(exists));
    });

    it('Has the init script', function() {
      return fs.readFile(TMPFILE, 'utf8')
      .then(content => {
        assert.isAbove(content.indexOf(HOST), 4);
        assert.isAbove(content.indexOf(PORT), 4);
      });
    });
  });
});
