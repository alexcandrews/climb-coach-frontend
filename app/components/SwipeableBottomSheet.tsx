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
        backgroundColor: 'rgba(245, 245, 245, 0.6)', // More transparent background
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1, // Reduced shadow opacity
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
        ...(Platform.OS === 'web' ? {
            // @ts-ignore - Web-specific style
            backdropFilter: 'blur(20px)', // Increased blur effect
        } : {}),
    },
    handle: {
        width: 75,
        height: 4,
        backgroundColor: 'rgba(102, 102, 102, 0.5)', // More transparent handle
        alignSelf: 'center',
        marginVertical: 15,
        borderRadius: 2,
    },
});

export default SwipeableBottomSheet; 