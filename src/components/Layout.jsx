import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
    return (
        <div className="flex bg-background text-text-primary min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col pl-[64px]">
                {/* We moved TopBar's title logic into TopBar or handle it dynamically, 
            but keeping the existing prop for now. We will use a generic TopBar or let pages define their title */}
                <main className="flex-1 p-6 overflow-y-auto hidden-scrollbar relative z-10 w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
