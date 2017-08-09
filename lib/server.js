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
    PORT = this.startServer();
    /**
     * Last message sent to clients.
     * @type {Object}
     */
    this.lastMessage = undefined;

    this.wss.on('connection', this._onConnected.bind(this));
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
   * @return {Number} Port on which the server is runing.
   */
  startServer() {
    var min = this._portRange[0];
    var max = this._portRange[1];
    var host = '127.0.0.1';
    for (let i = min; i <= max; i++) {
      try {
        this.wss = new ws.Server({
          port: i,
          host: host
        });
        return i;
      } catch (e) {}
    }
    throw new Error('No port available found.');
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
