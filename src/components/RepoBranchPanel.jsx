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
    X,
    Loader2,
    Trash2
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

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const RepoBranchPanel = ({ selectedFiles = [], onSelectedFilesChange }) => {
    const { user, getAuthToken } = useAuth();
    const [repo, setRepo] = useState(null);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const panelRef = useRef(null);

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
                const repoRes = await fetch(`${API_URL}${API_ROUTES.githubSelectedRepo}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const repoData = await repoRes.json();
                if (mounted && repoData?.repo?.full_name) setRepo(repoData.repo.full_name);

                const branchesRes = await fetch(`${API_URL}${API_ROUTES.githubBranches}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const branchesData = await branchesRes.json();
                if (mounted) {
                    setBranches(branchesData.branches || []);
                    if (!selectedBranch && branchesData.default_branch) setSelectedBranch(branchesData.default_branch);
                }
            } catch (err) {
                console.error('Loading error:', err);
            } finally {
                if (mounted) setIsInitialLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [user, getAuthToken]);

    const handleFileClick = (node) => {
        const isSelected = selectedFiles.some(f => f.path === node.path);
        if (isSelected) {
            onSelectedFilesChange(selectedFiles.filter(f => f.path !== node.path));
        } else {
            onSelectedFilesChange([...selectedFiles, node]);
        }
    };

    const renderTree = (nodes, level = 0) => {
        return Object.values(nodes)
            .sort((a, b) => (a.type === 'tree' ? -1 : 1))
            .map((node) => {
                const isSelected = selectedFiles.some(f => f.path === node.path);
                const hasChildren = node.type === 'tree' && Object.keys(node.children).length > 0;
                return (
                    <TreeItem
                        key={node.path}
                        nodeId={node.path}
                        label={node.name}
                        level={level}
                        hasChildren={hasChildren}
                        data={node}
                        className={cn(isSelected && "bg-[#6EE7B7]/10 text-[#6EE7B7]")}
                        onClick={() => node.type === 'blob' && handleFileClick(node)}
                    >
                        {isSelected && node.type === 'blob' && <Check className="w-3 h-3 text-[#6EE7B7] ml-auto mr-2" />}
                        {hasChildren && renderTree(node.children, level + 1)}
                    </TreeItem>
                );
            });
    };

    if (isInitialLoading) return null;

    const repoName = repo?.split('/')[1] || repo || "No Repo";

    return (
        <Panel position="top-left" className="ml-3 mt-3 z-[160] tour-repo">
            <div ref={panelRef} className="relative flex flex-col items-start gap-2">

                {/* Desktop Trigger */}
                <div className="hidden md:flex items-center bg-[#0D0D0D]/90 backdrop-blur-xl border border-[#222] rounded-xl overflow-hidden shadow-2xl transition-all hover:border-[#6EE7B7]/30">
                    <div className="flex items-center gap-2 px-3 py-2.5 border-r border-[#1A1A1A]">
                        <Github className="w-3.5 h-3.5 text-[#64748B]" />
                        <div className="flex flex-col leading-none">
                            <span className="font-mono text-[8px] text-[#444] uppercase tracking-widest">Workspace</span>
                            <span className="font-mono text-[11px] text-[#F1F5F9] font-semibold truncate max-w-[100px]">{repoName}</span>
                        </div>
                    </div>
                    <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 px-3 py-2.5 hover:bg-[#111] transition-colors">
                        <GitBranch className="w-3.5 h-3.5 text-[#6EE7B7]" />
                        <span className="font-mono text-[11px] text-[#6EE7B7] font-semibold">{selectedBranch || '—'}</span>
                        <ChevronDown className={cn("w-3 h-3 text-[#444] transition-transform", showDropdown && "rotate-180")} />
                    </button>
                </div>

                {/* Mobile Hamburger */}
                <div className="md:hidden">
                    <button onClick={() => setShowDropdown(!showDropdown)} className="w-10 h-10 flex items-center justify-center bg-[#0D0D0D]/90 border border-[#222] rounded-xl shadow-2xl">
                        <div className="relative flex flex-col justify-between w-4 h-3">
                            <motion.span animate={showDropdown ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} className="w-full h-[1.5px] bg-[#6EE7B7] rounded-full" />
                            <motion.span animate={showDropdown ? { opacity: 0 } : { opacity: 1 }} className="w-full h-[1.5px] bg-[#6EE7B7] rounded-full" />
                            <motion.span animate={showDropdown ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} className="w-full h-[1.5px] bg-[#6EE7B7] rounded-full" />
                        </div>
                    </button>
                </div>

                <AnimatePresence>
                    {showDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            /* Key Fixes: 
                               1. Increased z-index to 160 to sit above all other canvas elements.
                               2. Set max-height to 45vh to prevent clashing with the bottom UI.
                            */
                            className="absolute top-[100%] mt-2 left-0 w-[280px] max-h-[45vh] bg-[#0D0D0D]/95 backdrop-blur-2xl border border-[#222] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[160]"
                        >
                            {/* Header Info */}
                            <div className="px-4 py-3 border-b border-[#1A1A1A] bg-[#111]/30 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="font-mono text-[8px] text-[#444] uppercase tracking-widest">Project</span>
                                    <span className="font-mono text-[10px] text-[#F1F5F9] font-bold">{repoName}</span>
                                </div>
                                {selectedFiles.length > 0 && (
                                    <div className="bg-[#6EE7B7]/10 px-2 py-0.5 rounded-full">
                                        <span className="font-mono text-[9px] text-[#6EE7B7] font-bold">{selectedFiles.length} Selected</span>
                                    </div>
                                )}
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {/* Branch List */}
                                <div className="p-1.5 border-b border-[#1A1A1A]">
                                    {branches.map((b) => (
                                        <button key={b.name} onClick={() => setSelectedBranch(b.name)} className={cn("w-full flex items-center px-3 py-2 rounded-lg text-left", selectedBranch === b.name ? "bg-[#6EE7B7]/10 text-[#6EE7B7]" : "text-[#94A3B8] hover:bg-[#1A1A1A]")}>
                                            <GitBranch className="w-3 h-3 mr-2" />
                                            <span className="font-mono text-[11px] truncate">{b.name}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* File Tree */}
                                <div className="p-2">
                                    <div className="px-2 py-1 mb-1 flex items-center gap-2">
                                        <Folder className="w-3 h-3 text-[#444]" />
                                        <span className="font-mono text-[9px] text-[#444] uppercase font-bold tracking-widest">Files</span>
                                    </div>
                                    {treeLoading ? (
                                        <div className="py-10 flex flex-col items-center opacity-50"><Loader2 className="w-4 h-4 animate-spin text-[#6EE7B7]" /></div>
                                    ) : (
                                        <TreeProvider indent={12}><Tree>{renderTree(nestedTree)}</Tree></TreeProvider>
                                    )}
                                </div>
                            </div>

                            {/* Selection Action Footer */}
                            {selectedFiles.length > 0 && (
                                <div className="p-2 border-t border-[#1A1A1A] bg-[#0D0D0D]">
                                    <button
                                        onClick={() => onSelectedFilesChange([])}
                                        className="w-full py-2 font-mono text-[10px] text-[#F87171] bg-[#F87171]/5 hover:bg-[#F87171]/10 rounded-xl transition-colors border border-[#F87171]/10"
                                    >
                                        Clear {selectedFiles.length} Files
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Panel>
    );
};

export default RepoBranchPanel;