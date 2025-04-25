import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import supabase, { logoutUser, getUserProfile, updateUserProfile } from '@/lib/supabase';
import Colors, { Spacing, BorderRadius, Shadows } from '@/constants/Colors';

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
                    <ActivityIndicator size="large" color={Colors.primary.main} />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Profile</Text>
                    <TouchableOpacity onPress={toggleEditMode} disabled={isSaving}>
                        {isSaving ? (
                            <ActivityIndicator size="small" color={Colors.primary.main} />
                        ) : (
                            <Ionicons 
                                name={isEditing ? "checkmark" : "pencil"} 
                                size={24} 
                                color={Colors.primary.main} 
                            />
                        )}
                    </TouchableOpacity>
                </View>
                
                <View style={styles.profileHeader}>
                    {isEditing ? (
                        <TextInput
                            style={styles.nameInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your Name"
                            placeholderTextColor={Colors.text.disabled}
                        />
                    ) : (
                        <Text style={styles.nameText}>{name}</Text>
                    )}
                    <Text style={styles.emailText}>{email}</Text>
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
                                        color={yearsClimbing <= 0 ? Colors.text.disabled : Colors.primary.main} 
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
                                        color={yearsClimbing >= 50 ? Colors.text.disabled : Colors.primary.main} 
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
                        <Text style={styles.sectionValue}>{skillLevel}</Text>
                    )}
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Climbing Styles</Text>
                    
                    {isEditing ? (
                        <View style={styles.skillLevelsContainer}>
                            {CLIMBING_STYLES.map((style) => (
                                <TouchableOpacity
                                    key={style}
                                    style={[
                                        styles.skillLevelButton,
                                        climbingStyles.includes(style) && styles.skillLevelButtonSelected
                                    ]}
                                    onPress={() => toggleClimbingStyle(style)}
                                >
                                    <Text 
                                        style={[
                                            styles.skillLevelButtonText,
                                            climbingStyles.includes(style) && styles.skillLevelButtonTextSelected
                                        ]}
                                    >
                                        {style}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.sectionValue}>{climbingStyles.join(', ')}</Text>
                    )}
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Primary Goals</Text>
                    
                    {isEditing ? (
                        <View style={styles.goalsEditContainer}>
                            <TextInput
                                style={styles.goalsInput}
                                value={tempGoals}
                                onChangeText={setTempGoals}
                                placeholder="improve technique&#10;send a V8"
                                placeholderTextColor={Colors.text.disabled}
                                multiline
                            />
                        </View>
                    ) : (
                        <Text style={styles.sectionValue}>{primaryGoals}</Text>
                    )}
                </View>
                
                <TouchableOpacity 
                    style={styles.logoutButton} 
                    onPress={handleSignOut}
                >
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.default,
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        color: Colors.text.secondary,
        fontSize: 16,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    profileHeader: {
        marginBottom: Spacing.lg,
    },
    nameText: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    nameInput: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary.main,
        paddingVertical: Spacing.xs,
    },
    emailText: {
        fontSize: 16,
        color: Colors.text.secondary,
    },
    statsContainer: {
        backgroundColor: Colors.background.paper,
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
        color: Colors.primary.main,
        marginBottom: Spacing.xs,
    },
    statLabel: {
        fontSize: 14,
        color: Colors.text.secondary,
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
        backgroundColor: Colors.background.default,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: Spacing.xs,
        ...Shadows.sm,
    },
    section: {
        backgroundColor: Colors.background.paper,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        ...Shadows.sm,
    },
    sectionLabel: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },
    sectionValue: {
        fontSize: 18,
        color: Colors.text.primary,
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
        borderColor: Colors.text.disabled,
        backgroundColor: Colors.background.default,
        minWidth: '48%',
        alignItems: 'center',
    },
    skillLevelButtonSelected: {
        backgroundColor: Colors.primary.main,
        borderColor: Colors.primary.main,
    },
    skillLevelButtonText: {
        color: Colors.text.primary,
        fontWeight: '500',
    },
    skillLevelButtonTextSelected: {
        color: Colors.primary.contrast,
    },
    goalsEditContainer: {
        marginTop: Spacing.xs,
    },
    goalsInput: {
        fontSize: 18,
        color: Colors.text.primary,
        padding: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.text.disabled,
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
        color: Colors.primary.contrast,
        fontSize: 16,
        fontWeight: '500',
    },
});