import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Subtle grain/noise overlay for field-notes aesthetic.
 * Renders a semi-transparent overlay; for stronger grain use an image asset.
 */
export function GrainOverlay() {
  return (
    <View
      style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
      accessibilityElementsHidden
    >
      <View style={[StyleSheet.absoluteFill, styles.grain]} />
    </View>
  );
}

const styles = StyleSheet.create({
  grain: {
    backgroundColor: 'transparent',
    opacity: 0.04,
    borderWidth: 0.5,
    borderColor: 'rgba(211,84,0,0.06)',
  },
});
