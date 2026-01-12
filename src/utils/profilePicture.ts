/**
 * Unified Profile Picture Utilities
 * 
 * These utilities provide consistent handling of profile pictures and banners
 * across the entire application with proper fallbacks.
 */

/**
 * Get the profile picture URL with proper fallback to dicebear
 * Priority: profilePicUrl > profilePic > dicebear identicon
 * 
 * @param profilePicUrl - The URL from blob storage (new pattern)
 * @param profilePic - The legacy profile pic field
 * @param seed - Seed for dicebear fallback (typically nickname or id)
 * @returns The profile picture URL to use
 */
export const getProfilePicUrl = (
    profilePicUrl?: string | null,
    profilePic?: string | null,
    seed?: string | number | null
): string => {
    if (profilePicUrl) return profilePicUrl;
    if (profilePic) return profilePic;
    return `https://api.dicebear.com/9.x/identicon/svg?seed=${seed || 'default'}`;
};

/**
 * Get the banner URL with proper fallback to picsum
 * Priority: bannerPicUrl > bannerPic > picsum random
 * 
 * @param bannerPicUrl - The URL from blob storage (new pattern)
 * @param bannerPic - The legacy banner pic field
 * @param seed - Seed for picsum random (typically user/project id)
 * @returns The banner URL to use
 */
export const getBannerUrl = (
    bannerPicUrl?: string | null,
    bannerPic?: string | null,
    seed?: string | number | null
): string => {
    if (bannerPicUrl) return bannerPicUrl;
    if (bannerPic) return bannerPic;
    return `https://picsum.photos/900/200?random=${seed || '1'}`;
};

/**
 * Get the project image URL with proper fallback to picsum
 * Priority: imageUrl > picsum random
 * 
 * @param imageUrl - The image URL
 * @param seed - Seed for picsum random (typically project id)
 * @param size - Optional size for picsum (default: 200)
 * @returns The project image URL to use
 */
export const getProjectImageUrl = (
    imageUrl?: string | null,
    seed?: string | number | null,
    size: number = 200
): string => {
    if (imageUrl) return imageUrl;
    return `https://picsum.photos/${size}?random=${seed || '1'}`;
};

/**
 * Get user display info with proper fallbacks
 * 
 * @param user - User object with various possible fields
 * @returns Formatted user display info
 */
export interface UserDisplayInfo {
    displayName: string;
    profilePic: string;
    handle: string;
}

export interface UserInput {
    id?: string | number;
    name?: string | null;
    surname?: string | null;
    nickname?: string | null;
    profilePic?: string | null;
    profilePicUrl?: string | null;
}

export const getUserDisplayInfo = (user: UserInput | null | undefined): UserDisplayInfo => {
    if (!user) {
        return {
            displayName: 'Unknown',
            profilePic: getProfilePicUrl(null, null, 'unknown'),
            handle: '@unknown'
        };
    }

    const displayName = user.nickname || 
        `${user.name || ''} ${user.surname || ''}`.trim() || 
        'Unknown';
    
    const seed = user.nickname || user.id || 'default';

    return {
        displayName,
        profilePic: getProfilePicUrl(user.profilePicUrl, user.profilePic, seed),
        handle: `@${user.nickname || 'unknown'}`
    };
};
