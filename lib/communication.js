'use strict';
/**
 * Copyright (C) Mulesoft.
 * Shared under Apache 2.0 license
 *
 * @author Pawel Psztyc
 */
const parse5 = require('parse5');
const fs = require('fs-extra');
const path = require('path');
const babel = require('babel-core');
/**
 * A class responsible for altering console template by injecting
 * a coomunication bridge to connect to the web socket server.
 */
class CommunicationBridge {
  /**
   * @param {String} host Host name on which the web socket operates
   * @param {Number} port Web socket port name.
   */
  constructor(host, port) {
    this.host = host;
    this.port = port;
  }
  /**
   * Injects the `script-inject` template file to the console sources to enable
   * communication.
   *
   * @param {String} mainFile Console's main file as an absolute path to the
   * html file.
   * @return {Promise} Resolved promise when succeeded.
   */
  inject(mainFile) {
    this.doc = undefined;
    var body;
    return fs.readFile(mainFile, 'utf8')
    .then(content => parse5.parse(content))
    .then(ast => {
      this.doc = ast;
      body = this._getBody(ast);
      return this._createScriptNode(body);
    })
    .then(script => {
      body.childNodes.push(script);
      return this._saveAst(mainFile);
    });
  }

  /**
   * Serializes AST and saves content to the `mainFile`.
   *
   * @param {String} mainFile A file to write content into.
   * @return {Promise} Resolved promise when file is saved.
   */
  _saveAst(mainFile) {
    const html = parse5.serialize(this.doc);
    return fs.writeFile(mainFile, html, 'utf8');
  }
  /**
   * Finds a body node in the html5 parser results
   * @param {Object} ast html5 parser output
   * @return {Object} Body node description.
   */
  _getBody(ast) {
    // ast.childNodes[1] is the <html> tag
    const nodes = ast.childNodes[1].childNodes;
    return nodes.find(node => node.nodeName === 'body');
  }
  /**
   * Creates a `<script>` node definition for the parse5 serializer.
   *
   * @param {Object} parent Parent node description.
   * @return {Promise} Promise resolved to a `<script>` tag definition.
   */
  _createScriptNode(parent) {
    const node = {
      attrs: [],
      namespaceURI: 'http://www.w3.org/1999/xhtml',
      nodeName: 'script',
      tagName: 'script',
      parentNode: parent,
      childNodes: []
    };
    return this._createScriptText(node)
    .then(child => {
      node.childNodes.push(child);
      return node;
    });
  }
  /**
   * Creates a script's text content from a JavaScript file template.
   * @param {Object} parent A definition of the `<script>` node that contains
   * the script content.
   * @return {Promise} Text node for the script.
   */
  _createScriptText(parent) {
    return this._getScriptContent()
    .then(script => {
      var node = {
        nodeName: '#text',
        value: script,
        parentNode: parent
      };
      return node;
    });
  }
  /**
   * Reads template file content and creates bootstrap script for the breadge.
   *
   * @return {Promise} Content of the scipt to be injected into the console.
   */
  _getScriptContent() {
    const tpl = path.join(__dirname, 'script-inject.js');
    return fs.readFile(tpl, 'utf8')
    .then(content => {
      content += '\n';
      content += 'window.addEventListener(\'WebComponentsReady\',function(){';
      content += `bridge.connect('${this.host}', ${this.port});});`;
      try {
        content = babel.transform(content, {
          ast: false,
          babelrc: false,
          comments: false,
          presets: ['env']
        }).code;
      } catch (e) {
        console.info('Unable to transform JavaScript code. Probably error in it.');
      }
      return content;
    });
  }
}
exports.CommunicationBridge = CommunicationBridge;
