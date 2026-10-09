// Beat 1, 0.0-2.5s, frames 0-75: recognition. Frame 0 is the cover, so
// everything here is at rest from the first frame.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COPY, MERCHANTS } from '../content';
import { BEAT1, HEADLINE_TOP } from '../layout';
import { Banner, Headline } from '../parts';

export const BEAT1_OUT = 64;

export const Beat1Recognition: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Headline top={HEADLINE_TOP} lines={COPY.beat1.lines} accent={COPY.beat1.accent} accentClass="c-fail" hero frame={frame} outAt={BEAT1_OUT} />
      <Banner merchant={MERCHANTS.princessPolly} rect={BEAT1.banner} />
    </>
  );
};
