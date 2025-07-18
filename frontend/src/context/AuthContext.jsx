import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        setLoading(false);
    }, []);

    const login = async (email) => {
        try {                                      
            const response = await axios.post('http://localhost:3000/api/auth/login', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to send login email';
        }
    };

    const verifyToken = async (token) => {
        try {
            const response = await axios.post('http://localhost:3000/api/auth/verify', { token });
            const { token: jwtToken, user: userData } = response.data;
            
            // Store token and user data
            localStorage.setItem('authToken', jwtToken);
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
            
            setUser(userData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to verify token';
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        login,
        verifyToken,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 