import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

export const SunsetGlow = ({ opacity = 0.25 }: { opacity?: number }) => (
  <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
    <Defs>
      <RadialGradient id="glow" cx="50%" cy="10%" rx="55%" ry="35%">
        <Stop offset="0" stopColor="#F2A65A" stopOpacity={opacity} />
        <Stop offset="1" stopColor="#F2A65A" stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Ellipse cx="50%" cy="10%" rx="55%" ry="35%" fill="url(#glow)" />
  </Svg>
);
