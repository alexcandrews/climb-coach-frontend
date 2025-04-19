import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import supabase, { logoutUser } from '@/lib/supabase';
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
    const [name, setName] = useState('Alex Turner');
    const [yearsClimbing, setYearsClimbing] = useState(3);
    const [primaryGoals, setPrimaryGoals] = useState('Improve technique');
    const [skillLevel, setSkillLevel] = useState('Intermediate');
    const [climbingStyles, setClimbingStyles] = useState<string[]>(['Indoor Bouldering']);
    const [isEditing, setIsEditing] = useState(false);
    const [tempGoals, setTempGoals] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setEmail(user?.email);
        };
        loadUser();
    }, []);

    useEffect(() => {
        if (isEditing) {
            setTempGoals(primaryGoals);
        }
    }, [isEditing]);

    const handleSignOut = async () => {
        await logoutUser();
        router.replace('/');
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

    const toggleEditMode = () => {
        if (isEditing) {
            // Save all changes when exiting edit mode
            setPrimaryGoals(tempGoals.trim() || 'Improve technique');
        }
        setIsEditing(!isEditing);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Profile</Text>
                    <TouchableOpacity onPress={toggleEditMode}>
                        <Ionicons 
                            name={isEditing ? "checkmark" : "pencil"} 
                            size={24} 
                            color={Colors.primary.main} 
                        />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.profileHeader}>
                    <Text style={styles.nameText}>{name}</Text>
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