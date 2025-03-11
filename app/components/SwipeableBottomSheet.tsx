import React from 'react';
import { StyleSheet, Dimensions, Platform } from 'react-native';
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

type SwipeableBottomSheetProps = {
    children: React.ReactNode;
};

const SwipeableBottomSheet: React.FC<SwipeableBottomSheetProps> = ({ children }) => {
    const translateY = useSharedValue(SCREEN_HEIGHT - MIN_HEIGHT);

    const scrollTo = (destination: number) => {
        'worklet';
        translateY.value = withSpring(destination, { damping: 50 });
    };

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_event, ctx: any) => {
            ctx.startY = translateY.value;
        },
        onActive: (event, ctx: any) => {
            const newTranslateY = ctx.startY + event.translationY;
            translateY.value = Math.max(
                SCREEN_HEIGHT - MAX_HEIGHT,
                Math.min(SCREEN_HEIGHT - MIN_HEIGHT, newTranslateY)
            );
        },
        onEnd: (event) => {
            const velocity = event.velocityY;
            const shouldSnap = Math.abs(velocity) > 500;
            const currentHeight = SCREEN_HEIGHT - translateY.value;
            const midHeight = (MAX_HEIGHT + MIN_HEIGHT) / 2;

            if (shouldSnap) {
                if (velocity > 0) {
                    // Swipe down
                    scrollTo(SCREEN_HEIGHT - MIN_HEIGHT);
                } else {
                    // Swipe up
                    scrollTo(SCREEN_HEIGHT - MAX_HEIGHT);
                }
            } else if (currentHeight > midHeight) {
                scrollTo(SCREEN_HEIGHT - MAX_HEIGHT);
            } else {
                scrollTo(SCREEN_HEIGHT - MIN_HEIGHT);
            }
        },
    });

    const rBottomSheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        ...(Platform.OS === 'web' ? {
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
        } as any : {})
    }));

    return (
        <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
                <Animated.View style={styles.handle} />
                {children}
            </Animated.View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    bottomSheetContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: MAX_HEIGHT,
        backgroundColor: '#f5f5f5',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
    },
    handle: {
        width: 75,
        height: 4,
        backgroundColor: '#666',
        alignSelf: 'center',
        marginVertical: 15,
        borderRadius: 2,
    },
});

export default SwipeableBottomSheet; 