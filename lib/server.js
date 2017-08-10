'use strict';
/**
 * Copyright (C) Mulesoft.
 * Shared under Apache 2.0 license
 *
 * @author Pawel Psztyc
 */
const ws = require('ws');
/**
 * Registered port for the server.
 * Port can be in range 49152 to 65535.
 * @type {Number}
 */
var PORT;
/**
 * A class responsible for running web socket server and exchange data
 * between API console instance and generated RAML data.
 */
class PreviewServer {
  constructor() {
    this._portRange = [49152, 65535];
    this.host = '127.0.0.1';
    /**
     * Last message sent to clients.
     * @type {Object}
     */
    this.lastMessage = undefined;
  }

  get port() {
    return PORT;
  }
  /**
   * Sends message to all connected clients.
   *
   * @param {String} msg Message to send. It must be string.
   */
  _broadcast(msg) {
    this.wss.clients.forEach(client => {
      if (client.readyState === ws.OPEN) {
        client.send(msg);
      }
    });
  }
  /**
   * Sends RAML data to clients.
   * @param {Object} raml Generated RAML data to send.
   */
  sendRaml(raml) {
    const message = this.lastMessage = JSON.stringify({
      payload: 'raml',
      data: raml
    });
    this._broadcast(message);
  }
  /**
   * Sends an error message to the clients.
   * @param {String} level Error level.
   * @param {String} message Error message to display to the user.
   */
  sendError(level, message) {
    const send = this.lastMessage = JSON.stringify({
      payload: 'error',
      level: level,
      message: message || ''
    });
    this._broadcast(send);
  }
  /**
   * Sends information to clients that RAML data is being generated.
   */
  sendLoading() {
    const send = this.lastMessage = JSON.stringify({
      payload: 'generating-json'
    });
    this._broadcast(send);
  }
  /**
   * Handler for client connection.
   * If `lastMessage` is set (any message was sent to clients) then it resends
   * last message to newly connected client.
   */
  _onConnected(client) {
    if (this.lastMessage) {
      client.send(this.lastMessage);
    }
  }
  /**
   * Starts the WS server on first available port from range defined in
   * `this._portRange`.
   *
   * @return {Promise} Promise resolved when the server is started. Port number
   * is passed as an argument to the resolve function.
   */
  startServer() {
    var min = this._portRange[0];
    var max = this._portRange[1];
    return this._startNextServer(min, max)
    .then(init => {
      PORT = init[0];
      this.wss = init[1];
      this.wss.on('connection', this._onConnected.bind(this));
      return init[0];
    });
  }
  /**
   * Try to start server on next port from the port range passed as both
   * arguments.
   * It recursively tries to start a server until it start on first available
   * port ot rejects the promise if couldn't start the server in a ports range.
   *
   * TODO: Check if this may cause error of maximum calls stack if the port
   * range is huge and all ports are not available.
   *
   * @param {Number} start Minimum port number to start the server on.
   * @param {Number} end Minimum port number to start the server on.
   * @return {Promise} Resolved promise with server init information as an array,
   * where the first item is port number on which the server is running and
   * instance of the server as a second item of the array.
   */
  _startNextServer(start, end) {
    if (start > end) {
      return Promise.reject(new Error('Can\'t find available port to start server.'));
    }
    return this._tryStartServer(start)
    .then(wss => [start, wss])
    .catch(() => {
      start++;
      return this._startNextServer(start, end);
    });
  }
  /**
   * Tries to start a WS server. If the port is in use then the Promise
   * rejects.
   * @param {Number} port Port number to try to init the server at.
   * @return {Promise} Resolved promise with instance of the WS server.
   */
  _tryStartServer(port) {
    return new Promise((resolve, reject) => {
      let wss;
      const errFn = () => {
        wss.removeListener('error', errFn);
        reject();
      };
      wss = new ws.Server({
        port: port,
        host: this.host
      }, () => {
        wss.removeListener('error', errFn);
        resolve(wss);
      });
      wss.on('error', errFn);
    });
  }

  /**
   * Closes the server.
   */
  disconnect() {
    if (!this.wss) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      this.wss.close(() => {
        this.wss = undefined;
        resolve();
      });
    });
  }
}
exports.PreviewServer = PreviewServer;
