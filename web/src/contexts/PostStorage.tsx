import React, { createContext, useState } from 'react';

interface Schedule {
    class_id: Number;
    from: Number;
    to: Number;
    week_day: Number;
}

interface Post {
    avatar: String;
    bio: String;
    cost: Number;
    created_at: String;
    id: Number;
    name: String;
    schedule: Schedule[];
    subject: String;
    user_id: Number;
    whatsapp: String;
}

interface PostStorageData {
    storedPosts: Post[] | null;
    storedPage: number;
    chunkInfo: (page: number, data: Post[]) => void;
    storedProfilePosts: any;
    chunkProfilePostsInfo: (page: number, data: Post[], id: number) => void;
}

declare global {
    interface Window { stored_posts: any; }
}

const PostStorage = createContext<PostStorageData>({} as PostStorageData);

export const PostStorageProvider: React.FC = ({ children }) => {
    // main page
    const [storedPosts, setStoredPosts] = useState<Post[] | null>(null);
    const [storedPage, setStoredPage] = useState(1);

    //profile pages
    const [storedProfilePosts, setStoredProfilePosts] = useState({}) as any;

    function chunkInfo(page: number, teacher: Post[]) {
        setStoredPosts(teacher);
        setStoredPage(page);
    }

    function chunkProfilePostsInfo(page: number, teacher: Post[], user_id: number) {
        setStoredProfilePosts((prev: any) => {
            return {...prev, [user_id]: {page, teacher}};
        });
        window.stored_posts = {main: storedPosts, profiles: storedProfilePosts};
    }

    return <PostStorage.Provider value={{ storedPosts, storedPage, chunkInfo, storedProfilePosts, chunkProfilePostsInfo }} >
        {children}
    </PostStorage.Provider>
};

export default PostStorage;