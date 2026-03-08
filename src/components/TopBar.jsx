import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2, Zap, GitCommit, AlertCircle, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import WebhookDisplay from "./WebhookDisplay";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

/* ------------------ timeAgo helper ------------------ */
const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);

    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;

    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;

    return `${Math.floor(h / 24)}d ago`;
};

const TopBar = ({ title, children }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [activeNotifications, setActiveNotifications] = useState([]);
    const notificationsRef = useRef(null);

    /* ------------------ Load Workflow Runs ------------------ */
    useEffect(() => {
        if (!user) return;

        const loadNotifications = async () => {
            const { data } = await supabase
                .from("workflow_runs")
                .select("id, workflow_name, status, started_at, duration")
                .eq("user_id", user.id)
                .order("started_at", { ascending: false })
                .limit(5);

            if (data) {
                setActiveNotifications(
                    data.map((r) => ({
                        id: r.id,
                        name: r.workflow_name,
                        description: `${r.status === "success" ? "Completed" : "Failed"} in ${r.duration || "—"}`,
                        time: timeAgo(r.started_at),
                        iconType: r.status === "success" ? "success" : "error",
                        color: r.status === "success" ? "#6EE7B7" : "#F87171",
                    }))
                );
            }
        };

        loadNotifications();

        /* ------------------ Realtime Subscription ------------------ */
        const channel = supabase
            .channel("workflow_runs_changes")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "workflow_runs",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const r = payload.new;

                    setActiveNotifications((prev) =>
                        [
                            {
                                id: r.id,
                                name: r.workflow_name,
                                description: `${r.status === "success" ? "Completed" : "Failed"} in ${r.duration || "—"}`,
                                time: "just now",
                                iconType: r.status === "success" ? "success" : "error",
                                color: r.status === "success" ? "#6EE7B7" : "#F87171",
                            },
                            ...prev,
                        ].slice(0, 5)
                    );
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user]);

    /* ------------------ Close Dropdown Outside Click ------------------ */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ------------------ Icon Renderer ------------------ */
    const renderIcon = (type, color) => {
        const props = { className: "h-4 w-4", style: { color } };

        switch (type) {
            case "success":
                return <CheckCircle2 {...props} />;
            case "commit":
                return <GitCommit {...props} />;
            case "zap":
                return <Zap {...props} />;
            case "error":
                return <AlertCircle {...props} />;
            case "user":
                return <UserIcon {...props} />;
            default:
                return <Bell {...props} />;
        }
    };

    return (
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-[#222] bg-[#080808]/80 backdrop-blur-md sticky top-0 z-40 shrink-0 transition-colors duration-300">

            {/* Left Side */}
            <div className="flex items-center min-w-0 flex-1 mr-2">{title}</div>

            {/* Right Side */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0 relative">

                {children}

                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                    <button
                        className="relative p-2 text-[#64748B] hover:text-[#F1F5F9] transition-colors rounded-xl hover:bg-[#111]"
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                    >
                        <Bell className="h-4 w-4 md:h-5 md:w-5" />

                        {activeNotifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#6EE7B7] border-2 border-[#080808]"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {notificationsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-12 w-[300px] md:w-80 bg-[#0A0A0A] border border-[#222] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                            >
                                <div className="px-4 py-3 border-b border-[#222] flex justify-between items-center bg-[#111]">
                                    <span className="font-mono text-[#6EE7B7] text-xs tracking-widest uppercase font-bold">
                                        Activity Feed
                                    </span>

                                    <button className="font-mono text-[10px] text-[#64748B] hover:text-[#F1F5F9] transition-colors">
                                        Mark all read
                                    </button>
                                </div>

                                {/* Notifications List */}
                                <div className="flex flex-col max-h-80 overflow-y-auto hidden-scrollbar p-2 gap-2 bg-[#0A0A0A]">
                                    <AnimatePresence mode="popLayout">
                                        {activeNotifications.map((notif) => (
                                            <motion.div
                                                key={notif.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                className="relative w-full cursor-pointer overflow-hidden rounded-xl p-3 transition-all duration-200 ease-in-out hover:scale-[102%] bg-[#111] border border-[#222]"
                                            >
                                                <div className="flex flex-row items-center gap-3">

                                                    <div
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
                                                        style={{ backgroundColor: `${notif.color}1A` }}
                                                    >
                                                        {renderIcon(notif.iconType, notif.color)}
                                                    </div>

                                                    <div className="flex flex-col overflow-hidden min-w-0 flex-1">

                                                        <div className="flex flex-row items-center text-xs font-mono font-medium text-[#F1F5F9]">
                                                            <span className="truncate">{notif.name}</span>
                                                            <span className="mx-1 text-[#64748B]">·</span>
                                                            <span className="text-[10px] text-[#64748B] shrink-0">
                                                                {notif.time}
                                                            </span>
                                                        </div>

                                                        <p className="text-[10px] font-mono text-[#64748B] mt-0.5 truncate">
                                                            {notif.description}
                                                        </p>

                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <div className="p-2 border-t border-[#222] bg-[#111]">
                                    <button
                                        className="w-full py-2 text-center font-mono text-xs text-[#64748B] hover:text-[#6EE7B7] transition-colors lowercase"
                                        onClick={() => {
                                            setNotificationsOpen(false);
                                            navigate("/logs");
                                        }}
                                    >
                                        view all execution logs →
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="w-px h-5 bg-[#333] hidden sm:block mx-1"></div>

                <WebhookDisplay />
            </div>
        </header>
    );
};

export default TopBar;