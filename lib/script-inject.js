'use strict';
/**
 * Class responsible for connecting to the web socket server
 * and exchanging data between server and client.
 */
class ApiConsoleDevBridge {
  connect(host, port) {
    this.__handler = this._messageHandler.bind(this);
    this.__disconnect = this._disconnectHandler.bind(this);
    if (this.socket) {
      this._detachListeners();
      this.socket.close();
    }
    this.socket = new WebSocket(`ws://${host}:${port}`);
    this._attachListeners();
  }

  _attachListeners() {
    this.socket.addEventListener('message', this.__handler);
    this.socket.addEventListener('close', this.__disconnect);
  }

  _detachListeners() {
    this.socket.removeEventListener('message', this.__handler);
    this.socket.removeEventListener('close', this.__disconnect);
  }

  _messageHandler(message) {
    this.closeLoader();
    message = JSON.parse(message.data);
    switch (message.payload) {
      case 'raml':
        this._setRamlData(message.data);
        break;
      case 'generating-json':
        this.openLoader();
        break;
      case 'error':
        this._notifyError(message.level, message.message);
    }
  }

  _notifyError(level, message) {
    message = message || 'Unknown error ocurred :(';
    switch (level) {
      case 'critical':
        this._addCriticalErrorOverlay(message);
        break;
      default:
        this._toastError(message);
        break;
    }
  }
  /**
   * Displays an overlay without option to disable it when a critical
   * error occurred and the application won't recover from it.
   * @param {String} message Message to display.
   */
  _addCriticalErrorOverlay(message) {
    const dialog = document.createElement('paper-dialog');
    dialog.modal = true;
    const label = document.createElement('p');
    label.innerText = message;
    dialog.appendChild(label);
    document.body.appendChild(dialog);
    dialog.opened = true;
    this.criticalErrorBackdrop = dialog;
  }
  /**
   * Displays an error message as a toast message.
   * @param {String} message Message to display.
   */
  _toastError(message) {
    var toast = document.querySelector('paper-toast[data-bridge-error]');
    if (!toast) {
      toast = document.createElement('paper-toast');
      toast.dataset.bridgeError = true;
      document.body.appendChild(toast);
    }
    toast.text = message;
    toast.opened = true;
  }

  _setRamlData(raml) {
    if (this.criticalErrorBackdrop) {
      document.body.removeChild(this.criticalErrorBackdrop);
      this.criticalErrorBackdrop = undefined;
    }
    const apiConsole = document.querySelector('api-console');
    this._storePosition(apiConsole);
    apiConsole.raml = raml;
    this._restorePosition(apiConsole);
  }

  _storePosition(apiConsole) {
    this._lastUserPosition = {
      page: apiConsole.page,
      path: apiConsole.path,
      top: apiConsole.scrollTarget.scrollTop
    };
  }

  _restorePosition(apiConsole) {
    apiConsole.path = this._lastUserPosition.path;
    apiConsole.page = this._lastUserPosition.page;
    apiConsole.scrollTarget.scrollTop = this._lastUserPosition.top;
  }

  get loader() {
    return document.querySelector('paper-spinner[data-bridge-loader]');
  }
  /**
   * Activates a loader indicator.
   */
  openLoader() {
    var spinner = this.loader;
    if (!spinner) {
      spinner = document.createElement('paper-spinner');
      spinner.dataset.bridgeLoader = true;
      spinner.style.position = 'absolute';
      spinner.style.zIndex = 10000;
      spinner.style.top = '16px';
      spinner.style.right = '16px';
      document.body.appendChild(spinner);
    }
    spinner.active = true;
  }
  /**
   * Deactivates loading indicator.
   */
  closeLoader() {
    var spinner = this.loader;
    if (!spinner) {
      return;
    }
    spinner.active = false;
  }

  _disconnectHandler() {
    var message = 'API console can\'t connect to the server anymore.\n';
    message += 'Make sure the command is still running.';
    this._addCriticalErrorOverlay(message);
  }
}
/* jshint -W098 */
const bridge = new ApiConsoleDevBridge();
// bridge.connect('127.0.0.1', 8080); => to be set in injector
