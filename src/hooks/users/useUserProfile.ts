import { useState, useEffect, useCallback, useRef } from "react";
import { useGraphQL } from "../core/useGraphQL";
import { useAuth } from "../../context/AuthContext";
import { GRAPHQL_QUERIES } from "../../queries/graphql";
import { getProfilePicUrl, getBannerUrl } from "../../utils/profilePicture";

/**
 * Unified User Profile Data
 */
export interface UserProfileData {
    id: string;
    name: string;
    surname: string;
    nickname: string;
    email?: string;
    handle: string;
    bio: string;
    banner: string;
    pfp: string;
    abt: string;
    joined?: string;
    dateOfBirth?: string;
}

/**
 * Raw user data from GraphQL query
 */
interface RawUserData {
    id: string;
    name?: string;
    surname?: string;
    nickname?: string;
    email?: string;
    joined?: string;
    dateOfBirth?: string;
    profilePic?: string;
    profilePicUrl?: string;
    bannerPic?: string;
    bannerPicUrl?: string;
}

interface UserQueryResponse {
    users?: {
        getuserbyid?: RawUserData;
        me?: RawUserData;
        userbynickname?: RawUserData;
    };
}

interface UseUserProfileOptions {
    autoFetch?: boolean;
}

/**
 * Transform raw user data into unified profile format
 */
const transformUserData = (userInfo: RawUserData): UserProfileData => {
    return {
        id: String(userInfo.id),
        name: userInfo.name || '',
        surname: userInfo.surname || '',
        nickname: userInfo.nickname || '',
        email: userInfo.email,
        handle: `@${userInfo.nickname || 'unknown'}`,
        bio: "Professional developer", // TODO: Add bio field to backend
        banner: getBannerUrl(userInfo.bannerPicUrl, userInfo.bannerPic, userInfo.id),
        pfp: getProfilePicUrl(userInfo.profilePicUrl, userInfo.profilePic, userInfo.nickname || userInfo.id),
        abt: `Member since ${userInfo.joined ? new Date(userInfo.joined).toLocaleDateString() : 'Unknown'}`,
        joined: userInfo.joined,
        dateOfBirth: userInfo.dateOfBirth
    };
};

/**
 * Custom hook for fetching a user profile by ID or the current user
 * Uses the unified pattern from ProfilePage with proper fallbacks
 * 
 * @param userId - Optional user ID. If not provided, fetches current user
 * @param options - Configuration options
 * @returns { user, loading, error, refetch }
 */
export const useUserProfile = (
    userId?: string | number | null,
    options: UseUserProfileOptions = {}
) => {
    const { autoFetch = true } = options;
    const { isAuthenticated, authLoading } = useAuth();
    const { executeQuery } = useGraphQL();
    
    const [user, setUser] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    const fetchUserProfile = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch user details (either from userId param or current user)
            const userData = await executeQuery<UserQueryResponse>(
                userId ? GRAPHQL_QUERIES.GET_USER_BY_ID : GRAPHQL_QUERIES.GET_CURRENT_USER,
                userId ? { id: parseInt(String(userId)) } : {}
            );

            if (!userData || !userData.users) {
                console.error("User not found");
                setError("User not found");
                setLoading(false);
                return null;
            }

            const userInfo = userId ? userData.users?.getuserbyid : userData.users?.me;

            if (!userInfo) {
                console.error("User not found");
                setError("User not found");
                setLoading(false);
                return null;
            }

            const transformedUser = transformUserData(userInfo);
            setUser(transformedUser);
            setLoading(false);
            return transformedUser;
        } catch (err) {
            console.error("Failed to fetch user profile:", err);
            setError("Failed to fetch user profile");
            setLoading(false);
            return null;
        }
    }, [userId, executeQuery, isAuthenticated]);

    useEffect(() => {
        if (autoFetch && !authLoading && isAuthenticated && !hasFetched.current) {
            hasFetched.current = true;
            fetchUserProfile();
        }
    }, [autoFetch, authLoading, isAuthenticated, fetchUserProfile]);

    // Reset hasFetched when userId changes
    useEffect(() => {
        hasFetched.current = false;
    }, [userId]);

    // Refetch when userId changes and autoFetch is enabled
    useEffect(() => {
        if (autoFetch && !authLoading && isAuthenticated) {
            fetchUserProfile();
        }
    }, [userId, autoFetch, authLoading, isAuthenticated, fetchUserProfile]);

    return {
        user,
        loading: authLoading || loading,
        error,
        refetch: fetchUserProfile
    };
};

/**
 * Custom hook for fetching a user profile by nickname
 * 
 * @param nickname - The user's nickname
 * @param options - Configuration options
 * @returns { user, loading, error, refetch }
 */
export const useUserProfileByNickname = (
    nickname: string | null,
    options: UseUserProfileOptions = {}
) => {
    const { autoFetch = true } = options;
    const { isAuthenticated, authLoading } = useAuth();
    const { executeQuery } = useGraphQL();
    
    const [user, setUser] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    const fetchUserProfile = useCallback(async () => {
        if (!isAuthenticated || !nickname) {
            setLoading(false);
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const userData = await executeQuery<UserQueryResponse>(
                GRAPHQL_QUERIES.GET_USER_BY_NICKNAME,
                { nickname }
            );

            if (!userData?.users?.userbynickname) {
                console.error("User not found");
                setError("User not found");
                setLoading(false);
                return null;
            }

            const transformedUser = transformUserData(userData.users.userbynickname);
            setUser(transformedUser);
            setLoading(false);
            return transformedUser;
        } catch (err) {
            console.error("Failed to fetch user profile:", err);
            setError("Failed to fetch user profile");
            setLoading(false);
            return null;
        }
    }, [nickname, executeQuery, isAuthenticated]);

    useEffect(() => {
        if (autoFetch && !authLoading && isAuthenticated && nickname && !hasFetched.current) {
            hasFetched.current = true;
            fetchUserProfile();
        }
    }, [autoFetch, authLoading, isAuthenticated, nickname, fetchUserProfile]);

    // Reset hasFetched when nickname changes
    useEffect(() => {
        hasFetched.current = false;
    }, [nickname]);

    return {
        user,
        loading: authLoading || loading,
        error,
        refetch: fetchUserProfile
    };
};
