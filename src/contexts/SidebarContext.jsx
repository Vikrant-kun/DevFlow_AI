import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    // Pull initial state from localStorage
    const [isLocked, setIsLocked] = useState(() => {
        return localStorage.getItem('sidebar_locked') === 'true';
    });
    const [isExpanded, setIsExpanded] = useState(isLocked);

    // Sync lock state to storage
    useEffect(() => {
        localStorage.setItem('sidebar_locked', isLocked);
    }, [isLocked]);

    return (
        <SidebarContext.Provider value={{ isExpanded, setIsExpanded, isLocked, setIsLocked }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);