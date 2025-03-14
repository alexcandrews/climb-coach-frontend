import React from 'react';
import { StyleSheet, Dimensions, Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_HEIGHT = 350; // Initial height of the bottom sheet
const MAX_HEIGHT = SCREEN_HEIGHT - 100; // Maximum height, leaving some space at top
const DEBUG_MODE = __DEV__;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type SwipeableBottomSheetProps = {
    children: React.ReactNode;
};

const SwipeableBottomSheet: React.FC<SwipeableBottomSheetProps> = ({ children }) => {
    // Start at minimum height (showing MIN_HEIGHT from bottom)
    const translateY = useSharedValue(SCREEN_HEIGHT - MIN_HEIGHT);

    const scrollTo = (destination: number) => {
        'worklet';
        translateY.value = withSpring(destination, { 
            damping: 50,
            stiffness: 300,
        });
    };

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_event, ctx: any) => {
            ctx.startY = translateY.value;
        },
        onActive: (event, ctx: any) => {
            // Calculate new position
            const newTranslateY = ctx.startY + event.translationY;
            
            // Clamp the value between max height (smallest Y) and min height (largest Y)
            translateY.value = Math.max(
                SCREEN_HEIGHT - MAX_HEIGHT, // Upper bound (maximum up-swipe)
                Math.min(SCREEN_HEIGHT - MIN_HEIGHT, newTranslateY) // Lower bound (maximum down-swipe)
            );
        },
        onEnd: (event) => {
            const currentHeight = SCREEN_HEIGHT - translateY.value;
            const velocity = event.velocityY;
            const isQuickSwipe = Math.abs(velocity) > 500;

            if (isQuickSwipe) {
                // Quick swipe takes precedence over position
                if (velocity > 0) {
                    // Quick swipe down - minimize
                    scrollTo(SCREEN_HEIGHT - MIN_HEIGHT);
                } else {
                    // Quick swipe up - maximize
                    scrollTo(SCREEN_HEIGHT - MAX_HEIGHT);
                }
            } else {
                // No quick swipe - use position relative to middle
                const midHeight = (MAX_HEIGHT + MIN_HEIGHT) / 2;
                if (currentHeight > midHeight) {
                    // Past halfway point - maximize
                    scrollTo(SCREEN_HEIGHT - MAX_HEIGHT);
                } else {
                    // Before halfway point - minimize
                    scrollTo(SCREEN_HEIGHT - MIN_HEIGHT);
                }
            }
        },
    });

    const rBottomSheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.container, rBottomSheetStyle]} testID="swipeable-bottom-sheet">
                <BlurView intensity={25} tint="light" style={[StyleSheet.absoluteFill, styles.blurContainer]} testID="bottom-sheet-blur">
                    <View style={styles.handle} testID="bottom-sheet-handle" />
                    <View style={styles.contentContainer} testID="bottom-sheet-content">
                        {children}
                    </View>
                </BlurView>
            </Animated.View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: MAX_HEIGHT,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        ...(DEBUG_MODE && Platform.OS === 'web' ? {
            borderWidth: 2,
            borderColor: 'red',
        } : {}),
    },
    blurContainer: {
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        backgroundColor: Platform.select({
            ios: 'transparent',
            android: 'rgba(255, 255, 255, 0.1)',
            default: 'rgba(245, 245, 245, 0)',
        }),
        ...(DEBUG_MODE && Platform.OS === 'web' ? {
            borderWidth: 2,
            borderColor: 'blue',
        } : {}),
    },
    contentContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        ...(DEBUG_MODE && Platform.OS === 'web' ? {
            borderWidth: 2,
            borderColor: 'green',
        } : {}),
    },
    handle: {
        width: 75,
        height: 4,
        backgroundColor: 'rgba(102, 102, 102, 0.3)',
        alignSelf: 'center',
        marginVertical: 15,
        borderRadius: 2,
        ...(DEBUG_MODE && Platform.OS === 'web' ? {
            borderWidth: 2,
            borderColor: 'yellow',
        } : {}),
    },
});

export default SwipeableBottomSheet; 