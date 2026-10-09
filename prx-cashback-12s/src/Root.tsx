import React from 'react';
import { Composition } from 'remotion';
import { PrxCashback12s, type AdProps } from './Ad';
import { H, W } from './layout';
import { FPS } from './motion';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PrxCashback12s"
    component={PrxCashback12s}
    durationInFrames={360}
    fps={FPS}
    width={W}
    height={H}
    defaultProps={{ draft: true, qa: false } satisfies AdProps}
  />
);
