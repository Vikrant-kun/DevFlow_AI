import { useState, useEffect, useRef, useMemo } from 'react';
import { Panel } from '@xyflow/react';
import {
    Github,
    GitBranch,
    ChevronDown,
    Check,
    RefreshCw,
    Folder,
    File,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useRepoTree } from '../hooks/useRepoTree';
import { API_ROUTES } from "../lib/apiRoutes";
import { TreeProvider, Tree, TreeItem } from './ui/Tree';
import { cn } from '../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── TREE HELPERS ─────────────────────────────────────────────────────────────
const buildNestedTree = (files) => {
    if (!files) return {};
    const root = {};
    files.forEach(({ path, type, size }) => {
        const parts = path.split('/');
        let current = root;
        parts.forEach((part, i) => {
            if (!current[part]) {
                current[part] = {
                    name: part,
                    path: parts.slice(0, i + 1).join('/'),
                    type: i === parts.length - 1 ? type : 'tree',
                    size,
                    children: {}
                };
            }
            current = current[part].children;
        });
    });
    return root;
};

const renderTree = (nodes, level = 0, onFileClick) => {
    return Object.values(nodes)
        .sort((a, b) => {
            if (a.type === 'tree' && b.type !== 'tree') return -1;
            if (a.type !== 'tree' && b.type === 'tree') return 1;
            return a.name.localeCompare(b.name);
        })
        .map((node, i, arr) => {
            const hasChildren = node.type === 'tree' && Object.keys(node.children).length > 0;
            return (
                <TreeItem
                    key={node.path}
                    nodeId={node.path}
                    label={node.name}
                    level={level}
                    hasChildren={hasChildren}
                    isLast={i === arr.length - 1}
                    data={node}
                    onClick={() => {
                        if (node.type === 'blob') onFileClick(node);
                    }}
                >
                    {hasChildren && renderTree(node.children, level + 1, onFileClick)}
                </TreeItem>
            );
        });
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const RepoBranchPanel = ({ selectedFiles = [], onSelectedFilesChange = () => {} }) => {
    const { user, getAuthToken } = useAuth();
    const [repo, setRepo] = useState(null);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const panelRef = useRef(null);

    // Fetch file tree directly inside the panel using your custom hook [cite: 1842, 1887]
    const { tree, isLoading: treeLoading, error: treeError } = useRepoTree(getAuthToken, repo);
    const nestedTree = useMemo(() => buildNestedTree(tree), [tree]);

    useEffect(() => {
        if (!user) {
            setIsInitialLoading(false);
            return;
        }

        let mounted = true;

        const load = async () => {
            try {
                const token = await getAuthToken();

                // Get selected repo [cite: 328]
                const repoRes = await fetch(`${API_URL}${API_ROUTES.githubSelectedRepo}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!repoRes.ok) throw new Error('Repo fetch failed');
                const repoData = await repoRes.json();

                if (mounted && repoData?.repo?.full_name) {
                    setRepo(repoData.repo.full_name);
                }

                // Fetch branches [cite: 336]
                const branchesRes = await fetch(`${API_URL}${API_ROUTES.githubBranches}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!branchesRes.ok) throw new Error('Failed to fetch branches');
                const branchesData = await branchesRes.json();

                if (mounted) {
                    setRepo(branchesData.repo || repoData.repo?.full_name);
                    setBranches(branchesData.branches || []);
                    if (!selectedBranch && branchesData.default_branch) {
                        setSelectedBranch(branchesData.default_branch);
                    }
                }
            } catch (err) {
                console.error('Repo/branch loading error:', err);
            } finally {
                if (mounted) setIsInitialLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [user, getAuthToken]);

    const fetchBranches = async () => {
        if (!repo) return;
        setLoadingBranches(true);
        try {
            const token = await getAuthToken();
            const res = await fetch(`${API_URL}${API_ROUTES.githubBranches}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch branches');
            const data = await res.json();
            setRepo(data.repo);
            setBranches(data.branches || []);
            if (!selectedBranch && data.default_branch) setSelectedBranch(data.default_branch);
        } catch (err) {
            console.error('Refresh branches failed:', err);
        } finally {
            setLoadingBranches(false);
        }
    };

    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleFileClick = (node) => {
        onSelectedFilesChange(prev =>
            prev.find(f => f.path === node.path)
                ? prev.filter(f => f.path !== node.path)
                : [...prev, node]
        );
    };

    // Skeleton loader for initial state [cite: 393-401]
    if (isInitialLoading || (!repo && user)) {
        return (
            <Panel position="top-left" className="ml-3 mt-3 z-10 tour-repo">
                <div className="flex items-center bg-[#0D0D0D] border border-[#222] rounded-xl overflow-hidden shadow-xl w-[200px] h-[40px]">
                    <div className="flex items-center justify-center w-[40px] h-full border-r border-[#1A1A1A] shrink-0">
                        <div className="w-3.5 h-3.5 border-2 border-[#333] border-t-[#6EE7B7] rounded-full animate-spin" />
                    </div>
                    <div className="flex flex-col justify-center px-3 gap-1.5 w-full">
                        <div className="h-1.5 w-12 bg-[#1A1A1A] rounded animate-pulse" />
                        <div className="h-2 w-20 bg-[#222] rounded animate-pulse" />
                    </div>
                </div>
            </Panel>
        );
    }

    // No repo connected state
    if (!repo) {
        return (
            <Panel position="top-left" className="ml-3 mt-3 z-20">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#0D0D0D] border border-[#222] rounded-xl shadow-2xl">
                    <Github className="w-4 h-4 text-[#444]" />
                    <span className="font-mono text-[11px] text-[#64748B]">No repo connected</span>
                </div>
            </Panel>
        );
    }

    const repoName = repo.split('/')[1] || repo;

    return (
        <Panel position="top-left" className="ml-3 mt-3 z-[60] group tour-repo">
            <div ref={panelRef} className="relative flex flex-col items-start gap-2">

            {/* --- DESKTOP VIEW (Visible on md and up) --- */}
            <div className="hidden md:flex items-center bg-[#0D0D0D]/90 backdrop-blur-xl border border-[#222] rounded-xl overflow-hidden shadow-2xl transition-all group-hover:border-[#6EE7B7]/30">
                <div className="flex items-center gap-2 px-3 py-2.5 border-r border-[#1A1A1A]">
                    <Github className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                    <div className="flex flex-col leading-none">
                        <span className="font-mono text-[8px] text-[#444] uppercase tracking-widest">Workspace</span>
                        <span className="font-mono text-[11px] text-[#F1F5F9] font-semibold truncate max-w-[100px]">{repoName}</span>
                    </div>
                </div>

                <button 
                    onClick={() => setShowDropdown(!showDropdown)} 
                    className="flex items-center gap-2 px-3 py-2.5 hover:bg-[#111] transition-colors"
                >
                    <GitBranch className="w-3.5 h-3.5 text-[#6EE7B7] shrink-0" />
                    <div className="flex flex-col leading-none text-left">
                        <span className="font-mono text-[8px] text-[#444] uppercase tracking-widest">Context</span>
                        <span className="font-mono text-[11px] text-[#6EE7B7] font-semibold">{selectedBranch || '—'}</span>
                    </div>
                    <ChevronDown className={cn("w-3 h-3 text-[#444] transition-transform duration-300", showDropdown && "rotate-180")} />
                </button>

                <button
                    onClick={fetchBranches}
                    disabled={loadingBranches}
                    className="px-2.5 py-2.5 border-l border-[#1A1A1A] text-[#444] hover:text-[#6EE7B7] transition-colors"
                    title="Sync Repository"
                >
                    <RefreshCw className={cn("w-3 h-3", loadingBranches && "animate-spin text-[#6EE7B7]")} />
                </button>
            </div>

            {/* --- MOBILE VIEW TRIGGER (Simple & Clean) --- */}
            <div className="md:hidden">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-10 h-10 flex items-center justify-center bg-[#0D0D0D]/90 backdrop-blur-md border border-[#222] rounded-xl shadow-2xl"
                >
                    <div className="relative flex flex-col justify-between w-4 h-3">
                        <motion.span
                            animate={showDropdown ? { rotate: 45, y: 5.25 } : { rotate: 0, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full h-[1.5px] bg-[#6EE7B7] rounded-full origin-center"
                        />
                        <motion.span
                            animate={showDropdown ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-[1.5px] bg-[#6EE7B7] rounded-full"
                        />
                        <motion.span
                            animate={showDropdown ? { rotate: -45, y: -5.25 } : { rotate: 0, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full h-[1.5px] bg-[#6EE7B7] rounded-full origin-center"
                        />
                    </div>
                </button>
            </div>

                {/* --- THE UNIFIED WORKSPACE DROPDOWN --- [cite: 474-518] */}
                <AnimatePresence>
                    {showDropdown && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                            className="absolute top-[100%] mt-2 left-0 w-[260px] md:w-[280px] max-h-[55vh] md:max-h-[70vh] bg-[#0D0D0D]/95 backdrop-blur-2xl border border-[#222] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col will-change-transform z-50"
                        >
                            {/* Section 0: MOBILE ONLY - Repo Name Identity */}
                            <div className="md:hidden px-4 py-3 border-b border-[#1A1A1A] bg-[#111]/30">
                                <div className="flex items-center gap-2">
                                    <Github className="w-3.5 h-3.5 text-[#64748B]" />
                                    <div className="flex flex-col">
                                        <span className="font-mono text-[7px] text-[#444] uppercase tracking-widest">Workspace</span>
                                        <span className="font-mono text-[10px] text-[#F1F5F9] font-bold">{repoName}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 1: Sticky Branch Selector */}
                            <div className="shrink-0 bg-[#111]/50 border-b border-[#1A1A1A]">
                                <div className="px-4 py-2 border-b border-[#1A1A1A]/50">
                                    <span className="font-mono text-[9px] text-[#444] uppercase tracking-widest font-bold">Context</span>
                                </div>
                                <div className="max-h-[120px] overflow-y-auto p-1.5 no-scrollbar">
                                    {branches.map((branch) => (
                                        <button
                                            key={branch.name}
                                            onClick={() => setSelectedBranch(branch.name)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left group/item",
                                                selectedBranch === branch.name
                                                    ? "bg-[#6EE7B7]/10 border border-[#6EE7B7]/20"
                                                    : "hover:bg-[#1A1A1A] border border-transparent"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <GitBranch className={cn("w-3 h-3 shrink-0", selectedBranch === branch.name ? "text-[#6EE7B7]" : "text-[#444]")} />
                                                <span className={cn("font-mono text-[11px] truncate", selectedBranch === branch.name ? "text-[#F1F5F9]" : "text-[#94A3B8]")}>
                                                    {branch.name}
                                                </span>
                                            </div>
                                            {selectedBranch === branch.name && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] shadow-[0_0_8px_#6EE7B7]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section 2: File Explorer */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="px-4 py-2 flex items-center justify-between bg-[#080808]/50 shrink-0 border-b border-[#1A1A1A]/80">
                                    <div className="flex items-center gap-2">
                                        <Folder className="w-3.5 h-3.5 text-[#444]" />
                                        <span className="font-mono text-[9px] font-bold text-[#F1F5F9] uppercase tracking-widest">Files</span>
                                    </div>
                                    {treeLoading && (
                                        <Loader2 className="w-3 h-3 text-[#6EE7B7] animate-spin" />
                                    )}
                                </div>

                                {/* File Tree Body */}
                                <div className="overflow-y-auto p-2 no-scrollbar scroll-smooth">
                                    {treeLoading ? (
                                        <div className="py-12 flex flex-col items-center justify-center gap-2 opacity-50">
                                            <div className="w-4 h-4 border-2 border-[#111] border-t-[#6EE7B7] rounded-full animate-spin" />
                                            <span className="font-mono text-[8px] uppercase tracking-tighter text-[#444]">Indexing files...</span>
                                        </div>
                                    ) : treeError ? (
                                        <div className="py-8 text-center px-4">
                                            <span className="font-mono text-[9px] text-[#F87171] uppercase">Failed to load files</span>
                                        </div>
                                    ) : (
                                        <TreeProvider multiSelect={true} selectedIds={selectedFiles.map(f => f.path)} indent={12}>
                                            <Tree>
                                                {renderTree(nestedTree, 0, handleFileClick)}
                                            </Tree>
                                        </TreeProvider>
                                    )}
                                </div>
                            </div>

                            {/* Footer: Context Info */}
                            <div className="px-4 py-2 border-t border-[#1A1A1A] bg-[#0A0A0A] flex justify-between items-center shrink-0">
                                <span className="font-mono text-[9px] text-[#444]">{selectedFiles.length} files selected</span>
                                <div className="flex gap-1.5">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", selectedFiles.length > 0 ? "bg-[#6EE7B7]" : "bg-[#222]")} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#222]" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Panel>
    );
};

export default RepoBranchPanel;