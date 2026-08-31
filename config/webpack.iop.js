// Webpack build for the IoP standalone iframe, using bundleChromeShared (FEC#2363).
//
// foreman_rh_cloud embeds compliance via `<iframe src="/assets/apps/compliance/
// index.html">` — it loads index.html as a plain page, NOT as a Scalprum remote,
// so there is no insights-chrome host to initialize the module-federation share
// scope. FEC's default build marks react/react-dom AND every PatternFly dynamic
// component as chrome-provided shared deps (`import: false`), expecting that host
// to supply them — a bare iframe has no host, so the eager consume throws
// ("Shared module ... doesn't exist in shared scope").
//
// The fix is FEC#2363's `bundleChromeShared`: we KEEP the module-federation
// plugin (bin/webpack.plugins.js), but fec.iop.js sets
// `moduleFederation.bundleChromeShared: true`, which rewrites every
// chrome-provided `import: false` entry to an eager import from the app's own
// node_modules. The result is a self-contained SPA that still emits a proper
// federation container but bundles its chrome deps locally.
//
// Requires a config-utilities build that carries bundleChromeShared (FEC#2363,
// unreleased) — vendored as a file: tarball in package.json until it ships.
// (Was previously a federation-free build that omitted bin/webpack.plugins.js;
// that strip approach is retired in favour of the upstream bundleChromeShared.)

const path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const rootFolder = path.resolve(__dirname, '..');
process.env.FEC_ROOT_DIR = rootFolder;
// bin/webpack.plugins.js reads the fec config from FEC_CONFIG_PATH; point it at
// the IoP config so moduleFederation.bundleChromeShared is honoured.
process.env.FEC_CONFIG_PATH = path.resolve(__dirname, './fec.iop.js');

const createFecConfig = require('@redhat-cloud-services/frontend-components-config');
const fecConfig = require('./fec.iop');

const { plugins: externalPlugins = [], ...externalConfig } = fecConfig;

const { config, plugins } = createFecConfig({
  rootFolder,
  ...externalConfig,
  hotReload: false,
  deploymentBuild: true,
});

// Module-federation plugin. Evaluated at require time: it reads FEC_CONFIG_PATH
// (set above) and calls federatedModules({ ...fecConfig.moduleFederation }), so
// bundleChromeShared takes effect here.
const federationPlugins = require('@redhat-cloud-services/frontend-components-config/bin/webpack.plugins');
plugins.push(...federationPlugins);

// The app's own plugins (HtmlWebpackPlugin from fec.iop.js).
plugins.push(...externalPlugins);

module.exports = {
  ...config,
  mode: 'production',
  plugins,
};
