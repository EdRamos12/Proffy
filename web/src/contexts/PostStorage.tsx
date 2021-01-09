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
}

const PostStorage = createContext<PostStorageData>({} as PostStorageData);

export const PostStorageProvider: React.FC = ({ children }) => {
    const [storedPosts, setStoredPosts] = useState<Post[] | null>(null);
    const [storedPage, setStoredPage] = useState(1);

    function chunkInfo(page: number, teacher: Post[]) {
        setStoredPosts(teacher);
        setStoredPage(page);
    }

    return <PostStorage.Provider value={{ storedPosts, storedPage, chunkInfo }} >
        {children}
    </PostStorage.Provider>
};

export default PostStorage;