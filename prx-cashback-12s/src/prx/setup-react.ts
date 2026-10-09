// The PRX bundle is a classic script that reads window.React when it runs,
// so React must be on window before bundle.js is evaluated.
import React from 'react';

(window as unknown as { React: typeof React }).React = React;
