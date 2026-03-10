import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { isSignedIn, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-text-primary">Loading...</div>;
    }

    if (!isSignedIn) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
};