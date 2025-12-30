// src/screens/ColleaguesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Linking,
    Dimensions,
    Image,
    RefreshControl,
    Platform,
    Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getColleagues, batchFetchPhotos, getUserProfile } from '../services/user.service';
import { MessageCircle } from 'react-native-feather';


const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;


interface Colleague {
    id: string;
    displayName: string;
    userPrincipalName: string;
    jobTitle?: string;
    mail?: string;
    department?: string;
    officeLocation?: string;
}


interface SocialApp {
    name: string;
    color: string;
    icon: string;
    url: string;
}


// const SocialAppsSection = ({ onAppPress }: { onAppPress: (app: SocialApp) => void }) => {
//     const socialApps: SocialApp[] = [
//         { 
//             name: 'Teams', 
//             color: '#6264A7', 
//             icon: '👥',
//             url: 'https://teams.microsoft.com'
//         },
//         { 
//             name: 'Yammer', 
//             color: '#106EBE', 
//             icon: '💬',
//             url: 'https://www.yammer.com'
//         },
//         { 
//             name: 'SharePoint', 
//             color: '#0078D4', 
//             icon: '📁',
//             url: 'https://www.office.com/launch/sharepoint'
//         },
//         { 
//             name: 'Viva', 
//             color: '#5B5FC7', 
//             icon: '🌟',
//             url: 'https://www.office.com/launch/viva'
//         },
//     ];


//     return (
//         <View style={styles.socialSection}>
//             <Text style={styles.socialTitle}>Microsoft Social</Text>
//             <View style={styles.socialAppsContainer}>
//                 {socialApps.map((app, index) => (
//                     <TouchableOpacity
//                         key={index}
//                         style={[styles.socialAppCard, { backgroundColor: app.color }]}
//                         activeOpacity={0.8}
//                         onPress={() => onAppPress(app)}
//                     >
//                         <Text style={styles.socialAppIcon}>{app.icon}</Text>
//                         <Text style={styles.socialAppName}>{app.name}</Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>
//         </View>
//     );
// };


const ColleaguesScreen = () => {
    const { accessToken } = useAuth();
    const [colleagues, setColleagues] = useState<Colleague[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [photosCache, setPhotosCache] = useState<{ [key: string]: string }>({});
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);


    useEffect(() => {
        if (accessToken) {
            fetchCurrentUser();
            fetchColleagues();
        }
    }, [accessToken]);


    const fetchCurrentUser = async () => {
        if (!accessToken) return;
        try {
            const profile = await getUserProfile(accessToken);
            setCurrentUser(profile);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };


    const fetchColleagues = async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const colleaguesList = await getColleagues(accessToken);
            
            // Filter out current user
            const filteredColleagues = colleaguesList.filter(
                (colleague: Colleague) => colleague.id !== currentUser?.id
            );
            
            setColleagues(filteredColleagues);
            
            // Load photos for colleagues
            if (filteredColleagues.length > 0) {
                loadColleaguesPhotos(filteredColleagues, accessToken);
            }
        } catch (error) {
            console.error('Error fetching colleagues:', error);
        } finally {
            setLoading(false);
        }
    };


    const loadColleaguesPhotos = async (colleaguesList: Colleague[], token: string) => {
        setLoadingPhotos(true);
        try {
            const userIds = colleaguesList.slice(0, 50).map(c => c.id);
            const photos = await batchFetchPhotos(token, userIds);
            setPhotosCache(photos);
        } catch (error) {
            console.error('Error loading photos:', error);
        } finally {
            setLoadingPhotos(false);
        }
    };


    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchColleagues();
        setRefreshing(false);
    }, [accessToken, currentUser]);


    const handleSocialAppPress = async (app: SocialApp) => {
        try {
            const supported = await Linking.canOpenURL(app.url);
            
            if (supported) {
                // Open in external browser which will use system SSO
                await Linking.openURL(app.url);
            } else {
                Alert.alert(
                    'Cannot Open Link',
                    'Unable to open this link. Please check your internet connection.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error opening social app:', error);
            Alert.alert(
                'Error',
                'Could not open the app. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };


    const handleConnect = async (colleague: Colleague) => {
        // Correct Teams deep link format for starting a chat
        const teamsDeepLink = `msteams:/l/chat/0/0?users=${colleague.userPrincipalName}`;
        const teamsWebLink = `https://teams.microsoft.com/l/chat/0/0?users=${colleague.userPrincipalName}`;
        
        try {
            // Try to open the Teams app directly
            const supported = await Linking.canOpenURL(teamsDeepLink);
            
            if (supported) {
                await Linking.openURL(teamsDeepLink);
            } else {
                // If Teams app not installed, try the web link
                const webSupported = await Linking.canOpenURL(teamsWebLink);
                if (webSupported) {
                    await Linking.openURL(teamsWebLink);
                } else {
                    Alert.alert(
                        'Teams Not Available',
                        'Microsoft Teams app is not installed. Please install it to chat with colleagues.',
                        [{ text: 'OK' }]
                    );
                }
            }
        } catch (error) {
            console.error('Error opening Teams:', error);
            Alert.alert(
                'Unable to Open Teams',
                'Could not open Microsoft Teams. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };


    const renderColleagueCard = ({ item }: { item: Colleague }) => (
        <View style={styles.colleagueCard}>
            <View style={styles.photoContainer}>
                {photosCache[item.id] ? (
                    <Image 
                        source={{ uri: photosCache[item.id] }} 
                        style={styles.profilePhoto}
                    />
                ) : (
                    <View style={styles.profilePhotoPlaceholder}>
                        <Text style={styles.initialsText}>
                            {item.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </Text>
                    </View>
                )}
            </View>
            
            <Text style={styles.colleagueName} numberOfLines={2}>
                {item.displayName}
            </Text>
            
            {item.jobTitle ? (
                <Text style={styles.jobTitle} numberOfLines={2}>
                    {item.jobTitle}
                </Text>
            ) : (
                <View style={styles.jobTitlePlaceholder} />
            )}
            
            <TouchableOpacity
                style={styles.connectButton}
                onPress={() => handleConnect(item)}
                activeOpacity={0.8}
            >
                <MessageCircle width={16} height={16} color="white" strokeWidth={2.5} />
                <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
        </View>
    );


    const renderHeader = () => (
        <>
            {/* <SocialAppsSection onAppPress={handleSocialAppPress} /> */}
            <View style={styles.directoryHeader}>
                <Text style={styles.directoryTitle}>
                    People You Work With ({colleagues.length})
                </Text>
                {loadingPhotos && (
                    <Text style={styles.loadingPhotosText}>Loading photos...</Text>
                )}
            </View>
        </>
    );


    if (loading) {
        return (
            <View style={styles.container}>
                {/* <SocialAppsSection onAppPress={handleSocialAppPress} /> */}
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#0078D4" />
                    <Text style={styles.loadingText}>Finding your colleagues...</Text>
                </View>
            </View>
        );
    }


    if (colleagues.length === 0 && !loading) {
        return (
            <View style={styles.container}>
                {/* <SocialAppsSection onAppPress={handleSocialAppPress} /> */}
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No colleagues found</Text>
                    <Text style={styles.emptySubtext}>
                        Join some groups to see your colleagues here
                    </Text>
                </View>
            </View>
        );
    }


    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={renderHeader}
                data={colleagues}
                renderItem={renderColleagueCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#0078D4']}
                        tintColor="#0078D4"
                    />
                }
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    socialSection: {
        backgroundColor: 'white',
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    socialTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    socialAppsContainer: {
        // Removed flexDirection - defaults to 'column'
        // Removed flexWrap and justifyContent
        gap: 12, // Vertical spacing between cards
    },
    socialAppCard: {
        width: '100%', // Full width for single column
        height: 70, // Consistent height
        borderRadius: 16,
        paddingHorizontal: 20,
        flexDirection: 'row', // Icon and text side by side
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    socialAppIcon: {
        fontSize: 28,
        marginRight: 16, // Space between icon and text
    },
    socialAppName: {
        fontSize: 17,
        fontWeight: '600',
        color: 'white',
    },
    directoryHeader: {
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    directoryTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
    },
    loadingPhotosText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    colleagueCard: {
        width: CARD_WIDTH,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    photoContainer: {
        marginBottom: 12,
    },
    profilePhoto: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E8F4FD',
    },
    profilePhotoPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#0078D4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
    },
    colleagueName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 4,
        minHeight: 36,
    },
    jobTitle: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 12,
        minHeight: 32,
    },
    jobTitlePlaceholder: {
        height: 32,
        marginBottom: 12,
    },
    connectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0078D4',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    connectButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: 'white',
    },
});


export default ColleaguesScreen;
