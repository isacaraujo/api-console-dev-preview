'use strict';
/**
 * Class responsible for connecting to the web socket server
 * and exchanging data between server and client.
 */
class ApiConsoleDevBridge {
  connect(host, port) {
    this.__handler = this._messageHandler.bind(this);
    if (this.socket) {
      this._detachListeners();
      this.socket.close();
    }
    this.socket = new WebSocket(`ws://${host}:${port}`);
    this._attachListeners();
  }

  _attachListeners() {
    this.socket.addEventListener('message', this.__handler);
  }

  _detachListeners() {
    this.socket.removeEventListener('message', this.__handler);
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

  _addCriticalErrorOverlay(message) {
    const backdrop = document.createElement('div');
    backdrop.style.position = 'fixed';
    backdrop.style.top = 0;
    backdrop.style.right = 0;
    backdrop.style.bottom = 0;
    backdrop.style.left = 0;
    backdrop.style.backgroundColor = 'rgba(255,255,255,0.64)';

    const messageBox = document.createElement('div');
    messageBox.style.padding = '40px';
    messageBox.style.backgroundColor = 'rgb(255,255,255)';
    messageBox.style.border = '1px solid rgb(179, 179, 179)';
    messageBox.style.margin = 'calc(50% - 50px) auto';
    messageBox.style.width = '50%';
    messageBox.innerText = message;
    backdrop.appendChild(messageBox);

    document.body.appendChild(backdrop);

    this.criticalErrorBackdrop = backdrop;
  }

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
}
/* jshint -W098 */
const bridge = new ApiConsoleDevBridge();
// bridge.connect('127.0.0.1', 8080); => to be set in injector
