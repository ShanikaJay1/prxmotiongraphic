import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import './fonts';
import './prx';
import './ad.css';
import { Background, QaProbe, SafeAreaOverlay } from './parts';
import { Beat1Recognition } from './beats/Beat1Recognition';
import { Beat2Sting } from './beats/Beat2Sting';
import { Beat3Relief } from './beats/Beat3Relief';
import { Beat4Action } from './beats/Beat4Action';

export type AdProps = { draft: boolean; qa: boolean };

/** Beat frame ranges (brief, section 2). */
export const BEATS = [
  { name: 'Recognition', from: 0, duration: 75, Component: Beat1Recognition },
  { name: 'Sting', from: 75, duration: 75, Component: Beat2Sting },
  { name: 'Relief', from: 150, duration: 120, Component: Beat3Relief },
  { name: 'Action', from: 270, duration: 90, Component: Beat4Action },
];

export const PrxCashback12s: React.FC<AdProps> = ({ draft, qa }) => (
  <AbsoluteFill className="stage" id="prx-stage">
    <Background />
    {BEATS.map(({ name, from, duration, Component }) => (
      <Sequence key={name} name={name} from={from} durationInFrames={duration}>
        <Component />
      </Sequence>
    ))}
    {draft ? <SafeAreaOverlay /> : null}
    {qa ? <QaProbe rootId="prx-stage" /> : null}
  </AbsoluteFill>
);
