import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
    return (
        <div className="flex bg-background text-text-primary min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col pl-[64px] min-w-0">
                <main className="flex-1 overflow-y-auto hidden-scrollbar relative z-10 w-full bg-background flex flex-col">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
