import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import supabase, { logoutUser, getUserProfile, updateUserProfile } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import BorderRadius from '@/constants/BorderRadius';
import Shadows from '@/constants/Shadows';
import LogoHeader from '@/components/LogoHeader';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CLIMBING_STYLES = [
    'Indoor Bouldering',
    'Sport Climbing',
    'Trad Climbing',
    'Outdoor Bouldering',
    'Multi-pitch',
    'Gym Top-Rope'
];

export default function ProfileScreen() {
    const router = useRouter();
    const [email, setEmail] = useState<string | undefined>();
    const [name, setName] = useState('');
    const [yearsClimbing, setYearsClimbing] = useState(0);
    const [primaryGoals, setPrimaryGoals] = useState('');
    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [climbingStyles, setClimbingStyles] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoals, setTempGoals] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load user data
    useEffect(() => {
        async function loadUserData() {
            setIsLoading(true);
            try {
                // Load basic user info
                const { data: { user } } = await supabase.auth.getUser();
                setEmail(user?.email);

                // Default values in case profile doesn't exist
                setName(user?.email?.split('@')[0] || '');
                
                // Load profile data
                const { data: profile, error } = await getUserProfile();
                if (error) {
                    console.error('Error loading profile:', error);
                    Alert.alert('Error', 'Failed to load profile data. Using default values instead.');
                    return;
                }
                
                if (profile) {
                    console.log('Loaded profile:', profile);
                    setName(profile.name || user?.email?.split('@')[0] || '');
                    setYearsClimbing(profile.years_climbing || 0);
                    setPrimaryGoals(profile.primary_goals || 'Improve technique');
                    setSkillLevel(profile.skill_level || 'Beginner');
                    setClimbingStyles(profile.climbing_styles || ['Indoor Bouldering']);
                } else {
                    console.log('No profile found, using defaults');
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                Alert.alert('Error', 'Failed to load profile data. Using default values instead.');
            } finally {
                setIsLoading(false);
            }
        }

        loadUserData();
    }, []);

    useEffect(() => {
        if (isEditing) {
            setTempGoals(primaryGoals);
        }
    }, [isEditing]);

    const handleSignOut = async () => {
        try {
            await logoutUser();
            router.replace('/login');
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    const incrementYears = () => {
        if (yearsClimbing < 50) {
            setYearsClimbing(yearsClimbing + 1);
        }
    };

    const decrementYears = () => {
        if (yearsClimbing > 0) {
            setYearsClimbing(yearsClimbing - 1);
        }
    };

    const toggleClimbingStyle = (style: string) => {
        if (climbingStyles.includes(style)) {
            setClimbingStyles(climbingStyles.filter(s => s !== style));
        } else {
            setClimbingStyles([...climbingStyles, style]);
        }
    };

    const toggleEditMode = async () => {
        if (isEditing) {
            // Save all changes when exiting edit mode
            const updatedGoals = tempGoals.trim() || 'Improve technique';
            setPrimaryGoals(updatedGoals);
            
            // Save to Supabase
            setIsSaving(true);
            try {
                const { error, data } = await updateUserProfile({
                    name,
                    years_climbing: yearsClimbing,
                    primary_goals: updatedGoals,
                    skill_level: skillLevel,
                    climbing_styles: climbingStyles,
                });
                
                if (error) {
                    console.error('Profile update error details:', error);
                    throw new Error(typeof error === 'string' ? error : error.message || 'Unknown error');
                }
                
                console.log('Profile updated successfully:', data);
                // Success message
                Alert.alert('Success', 'Profile updated successfully');
            } catch (error) {
                console.error('Error updating profile:', error);
                Alert.alert('Error', `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                setIsSaving(false);
            }
        }
        setIsEditing(!isEditing);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                <LogoHeader marginBottom={10} />
                
                <View style={styles.profileHeader}>
                    <View style={styles.profileHeaderContent}>
                        {isEditing ? (
                            <TextInput
                                style={styles.nameInput}
                                value={name}
                                onChangeText={setName}
                                placeholder="Your Name"
                                placeholderTextColor={Colors.muted}
                            />
                        ) : (
                            <Text style={styles.nameText}>{name}</Text>
                        )}
                        <Text style={styles.emailText}>{email}</Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.editButton} 
                        onPress={toggleEditMode} 
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={Colors.accent} />
                        ) : (
                            <Ionicons 
                                name={isEditing ? "checkmark" : "pencil"} 
                                size={24} 
                                color={Colors.accent} 
                            />
                        )}
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                    style={styles.statsContainer}
                    activeOpacity={isEditing ? 0.7 : 1}
                >
                    <View style={styles.statBlock}>
                        <Text style={styles.statValue}>{yearsClimbing}</Text>
                        <Text style={styles.statLabel}>Years Climbing</Text>
                        
                        {isEditing && (
                            <View style={styles.yearsStepper}>
                                <TouchableOpacity 
                                    style={styles.stepperButton}
                                    onPress={decrementYears}
                                    disabled={yearsClimbing <= 0}
                                >
                                    <Ionicons 
                                        name="remove" 
                                        size={20} 
                                        color={yearsClimbing <= 0 ? Colors.muted : Colors.accent} 
                                    />
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.stepperButton}
                                    onPress={incrementYears}
                                    disabled={yearsClimbing >= 50}
                                >
                                    <Ionicons 
                                        name="add" 
                                        size={20} 
                                        color={yearsClimbing >= 50 ? Colors.muted : Colors.accent} 
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Skill Level</Text>
                    
                    {isEditing ? (
                        <View style={styles.skillLevelsContainer}>
                            {SKILL_LEVELS.map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.skillLevelButton,
                                        skillLevel === level && styles.skillLevelButtonSelected
                                    ]}
                                    onPress={() => {
                                        setSkillLevel(level);
                                    }}
                                >
                                    <Text 
                                        style={[
                                            styles.skillLevelButtonText,
                                            skillLevel === level && styles.skillLevelButtonTextSelected
                                        ]}
                                    >
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.detailBox}>
                            <Text style={styles.detailText}>{skillLevel}</Text>
                        </View>
                    )}
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Primary Goals</Text>
                    
                    {isEditing ? (
                        <TextInput
                            style={styles.goalsInput}
                            value={tempGoals}
                            onChangeText={setTempGoals}
                            placeholder="What do you want to achieve with your climbing?"
                            placeholderTextColor={Colors.muted}
                            multiline
                        />
                    ) : (
                        <View style={styles.detailBox}>
                            <Text style={styles.detailText}>{primaryGoals}</Text>
                        </View>
                    )}
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Climbing Styles</Text>
                    
                    {isEditing ? (
                        <View style={styles.climbingStylesContainer}>
                            {CLIMBING_STYLES.map((style) => (
                                <TouchableOpacity
                                    key={style}
                                    style={[
                                        styles.climbingStyleButton,
                                        climbingStyles.includes(style) && styles.climbingStyleButtonSelected
                                    ]}
                                    onPress={() => toggleClimbingStyle(style)}
                                >
                                    <Text 
                                        style={[
                                            styles.climbingStyleButtonText,
                                            climbingStyles.includes(style) && styles.climbingStyleButtonTextSelected
                                        ]}
                                    >
                                        {style}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.detailBox}>
                            {climbingStyles.length > 0 ? (
                                climbingStyles.map((style, index) => (
                                    <View key={style} style={styles.climbingStyleChip}>
                                        <Text style={styles.climbingStyleChipText}>{style}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No climbing styles selected</Text>
                            )}
                        </View>
                    )}
                </View>
                
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: Spacing.md,
        paddingTop: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        color: Colors.muted,
        fontSize: 16,
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },
    profileHeaderContent: {
        flex: 1,
    },
    editButton: {
        paddingTop: 4,
        paddingLeft: 10,
    },
    nameText: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    nameInput: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: Colors.accent,
        paddingVertical: Spacing.xs,
    },
    emailText: {
        fontSize: 16,
        color: Colors.muted,
    },
    statsContainer: {
        backgroundColor: Colors.dark.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        ...Shadows.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statBlock: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 26,
        fontWeight: 'bold',
        color: Colors.accent,
        marginBottom: Spacing.xs,
    },
    statLabel: {
        fontSize: 14,
        color: Colors.muted,
    },
    yearsStepper: {
        flexDirection: 'row',
        marginTop: Spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepperButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: Spacing.xs,
        ...Shadows.sm,
    },
    section: {
        backgroundColor: Colors.dark.card,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        ...Shadows.sm,
    },
    sectionLabel: {
        fontSize: 14,
        color: Colors.muted,
        marginBottom: Spacing.xs,
    },
    sectionValue: {
        fontSize: 18,
        color: Colors.text,
    },
    skillLevelsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: Spacing.sm,
        justifyContent: 'space-between',
    },
    skillLevelButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.muted,
        backgroundColor: Colors.background,
        minWidth: '48%',
        alignItems: 'center',
    },
    skillLevelButtonSelected: {
        backgroundColor: Colors.accent,
        borderColor: Colors.accent,
    },
    skillLevelButtonText: {
        color: Colors.text,
        fontWeight: '500',
    },
    skillLevelButtonTextSelected: {
        color: Colors.text,
    },
    goalsEditContainer: {
        marginTop: Spacing.xs,
    },
    goalsInput: {
        fontSize: 18,
        color: Colors.text,
        padding: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.muted,
        borderRadius: BorderRadius.md,
        minHeight: 80,
    },
    logoutButton: {
        backgroundColor: Colors.error,
        padding: Spacing.md,
        marginTop: Spacing.xl,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        ...Shadows.sm,
    },
    logoutText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    detailBox: {
        padding: Spacing.md,
        backgroundColor: Colors.dark.card,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        ...Shadows.sm,
    },
    detailText: {
        fontSize: 18,
        color: Colors.text,
    },
    climbingStylesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: Spacing.sm,
        justifyContent: 'space-between',
    },
    climbingStyleButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.muted,
        backgroundColor: Colors.background,
        minWidth: '48%',
        alignItems: 'center',
    },
    climbingStyleButtonSelected: {
        backgroundColor: Colors.accent,
        borderColor: Colors.accent,
    },
    climbingStyleButtonText: {
        color: Colors.text,
        fontWeight: '500',
    },
    climbingStyleButtonTextSelected: {
        color: Colors.text,
    },
    climbingStyleChip: {
        padding: Spacing.xs,
        backgroundColor: Colors.accent,
        borderRadius: BorderRadius.md,
        marginRight: Spacing.xs,
    },
    climbingStyleChipText: {
        color: Colors.text,
        fontWeight: '500',
    },
    emptyText: {
        color: Colors.muted,
        fontSize: 16,
    },
    signOutButton: {
        backgroundColor: Colors.error,
        padding: Spacing.md,
        marginTop: Spacing.xl,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        ...Shadows.sm,
    },
    signOutButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
});