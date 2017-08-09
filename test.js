const {ApiConsoleDevPreview} = require('./lib/dev-preview');

const prev = new ApiConsoleDevPreview({
  projectRoot: './test/api/',
  api: 'api.raml',
  src: 'test/api-console-master.zip',
  sourceIsZip: true
});
prev.run();
