import { createRoot } from 'react-dom/client';
import React from 'react';
import { initSharedScope } from '@scalprum/core';

import '@patternfly/patternfly/patternfly.scss';
import '@patternfly/patternfly/patternfly-addons.scss';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.scss';
import '@patternfly/patternfly/utilities/Spacing/spacing.scss';
import '@patternfly/patternfly/patternfly-charts.scss';

import IopAppEntry from './IopAppEntry';
import './iopPage.scss';

const mountNode = document.getElementById('root');

// The iframe has no insights-chrome / Scalprum host, so nothing seeds the
// webpack share scope. ScalprumProvider (in IopBridge) calls getSharedScope()
// synchronously on mount, which throws "Attempt to access share scope object
// before its initialization" unless __webpack_init_sharing__('default') ran
// first. We load no remotes, so an empty-but-initialized 'default' scope is all
// it needs. Seed it before rendering.
const start = async () => {
  await initSharedScope();

  if (mountNode) {
    createRoot(mountNode).render(<IopAppEntry environment="production" />);
  }
};

start();
