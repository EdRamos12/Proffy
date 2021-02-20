import React, { createContext, useState, useCallback, useContext } from 'react';
import api from '../services/api';
import { useHistory } from 'react-router-dom';

interface User {
    id: Number;
    name: string;
    avatar: string;
    whatsapp: string;
    bio: string;
    total_connections: Number;
    email: string;
}

interface AuthContextData {
    authenticated: Boolean;
    loading: Boolean;
    user: User | null;
    signIn(email: string, password: string, rememberMe: boolean): Promise<boolean>;
    signOut(): Promise<void>;
    verifyAuthentication(): Promise<Boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
    const history = useHistory();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    async function signIn(email: string, password: string, rememberMe: boolean) {
        try {
            const info = await api.post('/authenticate', {
                email,
                password,
                remember_me: rememberMe,
            }, { withCredentials: true });
            setUser(info.data);
            return true;
        } catch (error) {
            return false;
        }
    }

    const signOut = useCallback(
        async () => {
            try {
                await api.get('/logout', { withCredentials: true });
                setUser(null);
                history.push('/');
            } catch (error) {
                console.error(error.response);
                alert(`An error ocurred, check logs for details: ${error.response.data.message}`)
            }
        },
        [history]
    )

    async function verifyAuthentication() {
        const info = await api.get('/verify', { withCredentials: true });
        try {
            setLoading(false);
            setUser(info.data);
            return true;
        } catch (err) {
            if (err.response.status === 429) {
                alert(err.response.data.message);
                return true;
            }
            else {
                console.log(err);
                setUser(null);
            }
            return false;
        }
    }

    return (
        <AuthContext.Provider value={{ authenticated: Boolean(user), user, loading, signOut, signIn, verifyAuthentication }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;