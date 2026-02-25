import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const TOPO_COLOR = '#C45C2C';

/** Mountain silhouette (bottom half) + topographic lines. Shared by Welcome and Auth. */
export function TopoBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        {/* Bottom half: transparent mountain shapes (layered peaks) */}
        <Path
          d="M0 600 L0 380 L80 480 L160 340 L240 420 L320 280 L400 360 L400 600 Z"
          fill={TOPO_COLOR}
          fillOpacity={0.11}
        />
        <Path
          d="M0 600 L0 420 L60 500 L140 380 L220 460 L300 320 L400 400 L400 600 Z"
          fill={TOPO_COLOR}
          fillOpacity={0.09}
        />
        <Path
          d="M0 600 L0 460 L100 540 L200 440 L280 520 L360 400 L400 460 L400 600 Z"
          fill={TOPO_COLOR}
          fillOpacity={0.07}
        />
        {/* Topographic contour lines — above the mountain */}
        <Path d="M0 60 Q80 40 160 60 T320 55 T400 60" fill="none" stroke={TOPO_COLOR} strokeWidth={1} opacity={0.26} />
        <Path d="M0 110 Q100 85 200 110 T400 105" fill="none" stroke={TOPO_COLOR} strokeWidth={0.9} opacity={0.22} />
        <Path d="M0 165 Q60 140 120 165 T240 165 T360 160 T400 165" fill="none" stroke={TOPO_COLOR} strokeWidth={0.9} opacity={0.19} />
        <Path d="M0 220 Q120 195 240 220 T400 215" fill="none" stroke={TOPO_COLOR} strokeWidth={0.8} opacity={0.16} />
        <Path d="M0 275 Q80 250 160 275 T320 275 T400 270" fill="none" stroke={TOPO_COLOR} strokeWidth={0.8} opacity={0.14} />
        <Path d="M0 330 Q100 305 200 330 T400 325" fill="none" stroke={TOPO_COLOR} strokeWidth={0.7} opacity={0.12} />
        <Path d="M0 385 Q70 360 140 385 T280 385 T400 380" fill="none" stroke={TOPO_COLOR} strokeWidth={0.7} opacity={0.11} />
        <Path d="M0 440 Q90 415 180 440 T360 440 T400 435" fill="none" stroke={TOPO_COLOR} strokeWidth={0.6} opacity={0.1} />
        <Path d="M0 495 Q50 475 100 495 T200 495 T300 490 T400 495" fill="none" stroke={TOPO_COLOR} strokeWidth={0.6} opacity={0.09} />
        <Path d="M0 550 Q130 520 260 550 T400 545" fill="none" stroke={TOPO_COLOR} strokeWidth={0.5} opacity={0.08} />
      </Svg>
    </View>
  );
}
