import { Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
            <div>
                <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-glow-primary"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-border group cursor-pointer" onClick={handleLogout}>
                    <div className="h-8 w-8 rounded-full bg-surface-2 overflow-hidden flex items-center justify-center">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-sm font-medium text-ai">
                                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </span>
                        )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                </div>
            </div>
        </header>
    );
};

export default TopBar;
