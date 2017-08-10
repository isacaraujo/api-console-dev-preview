'use strict';

const {ApiConsoleDevPreview} = require('../lib/dev-preview');
const assert = require('chai').assert;
const WebSocketNode = require('ws');

describe('Websocket server', () => {

  var processor;
  const host  = '127.0.0.1';

  describe('Running server', function() {
    this.timeout(5000);
    const options = {
      projectRoot: './test/api/',
      api: 'api.raml'
    };
    var port;
    var ws;
    before(function() {
      processor = new ApiConsoleDevPreview(options);
      processor.raml = {title: 'Test'};
      return processor._runWsServer()
      .then(initPort => {
        port  = initPort;
      });
    });

    afterEach(function(done) {
      if (ws) {
        ws.on('close', () => done());
        ws.close(1000, 'bye');
      } else {
        done();
      }
    });

    it('Server accepts connections', function(done) {
      ws = new WebSocketNode(`ws://${host}:${port}`);
      ws.on('open', function() {
        done();
      });
      ws.on('error', function(e) {
        done(e);
      });
    });

    it('Receive last message after connection', function(done) {
      ws = new WebSocketNode(`ws://${host}:${port}`);
      ws.on('message', function(data) {
        assert.isString(data);
        done();
      });
    });

    it('Receive last message is RAML message', function(done) {
      ws = new WebSocketNode(`ws://${host}:${port}`);
      ws.on('message', function(data) {
        data = JSON.parse(data);
        assert.equal(data.payload, 'raml', 'Passed data has payload property');
        assert.typeOf(data.data.title, 'string', 'Contains RAML data.');
        done();
      });
    });
  });

  describe('Updating clients', function() {
    this.timeout(10000);
    const options = {
      projectRoot: './test/api/',
      api: 'api.raml'
    };

    var port;
    var ws;
    before(function() {
      processor = new ApiConsoleDevPreview(options);
      processor.raml = {title: 'Test'};
      return processor._runWsServer()
      .then(initPort => {
        port  = initPort;
      });
    });

    beforeEach(function(done) {
      ws = new WebSocketNode(`ws://${host}:${port}`);
      const msgHandler = function() {
        ws.removeListener('message', msgHandler);
        done();
      };
      ws.on('message', msgHandler);
    });

    afterEach(function(done) {
      if (ws) {
        ws.on('close', () => done());
        ws.close(1000, 'bye');
      } else {
        done();
      }
    });

    it('Receives updated RAML data', function(done) {
      ws.on('message', function(data) {
        data = JSON.parse(data);
        assert.equal(data.payload, 'raml', 'Passed data has payload property');
        assert.typeOf(data.data.version, 'string', 'Contains RAML data.');
        done();
      });
      processor.server.sendRaml({version: 'vTest'});
    });

    it('Receives "loading" message', function(done) {
      ws.on('message', function(data) {
        data = JSON.parse(data);
        assert.equal(data.payload, 'generating-json', 'Passed data has payload property');
        done();
      });
      processor.server.sendLoading();
    });

    it('_updateApiData() updates RAML data', function(done) {
      ws.on('message', function(data) {
        try {
          data = JSON.parse(data);
          assert.equal(data.data.title, 'Advanced REST Client Echo service');
        } catch (e) {
          done(e);
          return;
        }
        done();
      });
      processor._updateApiData();
    });

  });
});
