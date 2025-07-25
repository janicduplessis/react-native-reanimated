import { useHeaderHeight } from '@react-navigation/elements';
import type React from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated';

const windowDimensions = Dimensions.get('window');

const colors = [
  'black',
  'blue',
  'green',
  'yellow',
  'red',
  'gray',
  'pink',
  'orange',
];

const boxHeight = 120;

function friction(value: number) {
  'worklet';

  const MAX_FRICTION = 200;
  const MAX_VALUE = 400;

  const res = Math.max(
    1,
    Math.min(
      MAX_FRICTION,
      1 + (Math.abs(value) * (MAX_FRICTION - 1)) / MAX_VALUE
    )
  );

  if (value < 0) {
    return -res;
  }

  return res;
}

function ScrollableView({
  children,
}: React.PropsWithChildren<Record<never, never>>) {
  const translateY = useSharedValue(0);
  const loverBound = useSharedValue(0);
  const headerHeight = useHeaderHeight();

  function onLayout(evt: LayoutChangeEvent) {
    loverBound.value =
      windowDimensions.height - headerHeight - evt.nativeEvent.layout.height;
  }

  const startY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      const currentTranslateY = translateY.value;
      startY.value = currentTranslateY;
      translateY.value = currentTranslateY; // for stop animation (assigning to a shared value stops running animation)
    })
    .onUpdate((event) => {
      const nextTranslate = startY.value + event.translationY;

      if (nextTranslate < loverBound.value) {
        translateY.value =
          loverBound.value + friction(nextTranslate - loverBound.value);
      } else if (nextTranslate > 0) {
        translateY.value = friction(nextTranslate);
      } else {
        translateY.value = nextTranslate;
      }
    })
    .onEnd((event) => {
      if (translateY.value < loverBound.value || translateY.value > 0) {
        const toValue = translateY.value > 0 ? 0 : loverBound.value;

        translateY.value = withTiming(toValue, {
          duration: 250,
          easing: Easing.bezierFn(0.25, 0.1, 0.25, 1),
        });
      } else {
        translateY.value = withDecay({
          clamp: [loverBound.value, 0],
          velocity: event.velocityY,
        });
      }
    });

  const animatedStyles = useAnimatedStyle(() => {
    return {
      height: boxHeight * colors.length,
      transform: [
        {
          translateY: translateY.value,
        },
      ],
    };
  });

  return (
    <View style={styles.flexOne}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyles}>
          <View onLayout={onLayout}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function Box({ color }: { color: string }) {
  return <View style={[{ backgroundColor: color }, styles.box]} />;
}

export default function ScrollableViewExample() {
  const headerHeight = useHeaderHeight();

  const height =
    Platform.OS === 'web' ? windowDimensions.height - headerHeight : undefined;

  return (
    <View style={[styles.wrapper, { height }]}>
      <ScrollableView>
        {colors.map((color) => (
          <Box color={color} key={color} />
        ))}
      </ScrollableView>
    </View>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  box: {
    height: boxHeight,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  wrapper: {
    overflow: Platform.OS === 'web' ? 'hidden' : undefined,
  },
});
