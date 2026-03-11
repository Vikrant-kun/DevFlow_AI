import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Folder, FolderOpen, File, GitBranch, Loader2 } from 'lucide-react';
import { TreeProvider, Tree, TreeItem } from './ui/Tree';
import { useRepoTree } from '../hooks/useRepoTree';
import { useAuth } from '../contexts/AuthContext';

const buildNestedTree = (files) => {
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

const RepoFileTree = ({ onFileSelect, selectedFiles = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { getAuthToken, selectedRepo } = useAuth();
    const { tree, isLoading, error } = useRepoTree(getAuthToken, selectedRepo);

    const nestedTree = buildNestedTree(tree);

    const handleFileClick = (node) => {
        if (onFileSelect) onFileSelect(node);
    };

    return (
        <div className="absolute left-0 top-[120px] z-40 flex items-start">
            {/* Shutter panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-64 max-h-[60vh] bg-[#0D0D0D] border border-[#1A1A1A] rounded-r-xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#1A1A1A] shrink-0">
                            <GitBranch className="w-3.5 h-3.5 text-[#6EE7B7]" />
                            <span className="font-mono text-[11px] font-bold text-[#F1F5F9] truncate">
                                {selectedRepo?.full_name || selectedRepo?.name || 'No repo selected'}
                            </span>
                        </div>

                        {/* Selected files count */}
                        {selectedFiles.length > 0 && (
                            <div className="px-3 py-1.5 bg-[#6EE7B7]/8 border-b border-[#6EE7B7]/20">
                                <span className="font-mono text-[10px] text-[#6EE7B7]">
                                    {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                                </span>
                            </div>
                        )}

                        {/* Tree content */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1A1A1A] p-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8 gap-2">
                                    <Loader2 className="w-4 h-4 text-[#6EE7B7] animate-spin" />
                                    <span className="font-mono text-[10px] text-[#444]">Loading files...</span>
                                </div>
                            ) : error ? (
                                <div className="py-6 text-center">
                                    <p className="font-mono text-[10px] text-[#F87171]">Failed to load</p>
                                    <p className="font-mono text-[9px] text-[#444] mt-1">{error}</p>
                                </div>
                            ) : !selectedRepo ? (
                                <div className="py-6 text-center">
                                    <p className="font-mono text-[10px] text-[#444]">No repo connected</p>
                                    <p className="font-mono text-[9px] text-[#333] mt-1">Connect GitHub first</p>
                                </div>
                            ) : Object.keys(nestedTree).length === 0 ? (
                                <div className="py-6 text-center">
                                    <p className="font-mono text-[10px] text-[#444]">No files found</p>
                                </div>
                            ) : (
                                <TreeProvider
                                    multiSelect={true}
                                    selectedIds={selectedFiles.map(f => f.path)}
                                    showLines={true}
                                    indent={14}
                                    className="bg-transparent border-none shadow-none"
                                >
                                    <Tree>
                                        {renderTree(nestedTree, 0, handleFileClick)}
                                    </Tree>
                                </TreeProvider>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="px-3 py-2 border-t border-[#1A1A1A] shrink-0">
                            <p className="font-mono text-[9px] text-[#333]">
                                Click files to select • Ctrl+click multi-select
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shutter tab — always visible */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-5 h-16 bg-[#0D0D0D] border border-[#1A1A1A] rounded-r-lg shadow-lg hover:bg-[#111] hover:border-[#333] transition-all mt-2"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.95 }}
            >
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronRight className="w-3 h-3 text-[#6EE7B7]" />
                </motion.div>
            </motion.button>
        </div>
    );
};

export default RepoFileTree;