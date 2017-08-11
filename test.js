const {ApiConsoleDevPreview} = require('./lib/dev-preview');

const prev = new ApiConsoleDevPreview({
  projectRoot: './test/api/',
  api: 'api.raml',
  // projectRoot: './test/testcase-1/',
  src: 'test/api-console-installed.zip',
  sourceIsZip: true,
  noBower: true,
  verbose: false,
  open: true
});
prev.run();
