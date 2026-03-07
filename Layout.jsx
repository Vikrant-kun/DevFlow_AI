import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex bg-background text-text-primary min-h-screen">
            <Sidebar />
            {/* pt-[76px] on mobile = 2-row topbar (h-10 logo + h-9 menu = 76px) */}
            <div className="flex-1 flex flex-col pt-[76px] md:pt-0 md:pl-[56px] min-w-0">
                <main className="flex-1 overflow-y-auto hidden-scrollbar relative z-10 w-full bg-background flex flex-col">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
