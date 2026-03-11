import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { ChevronRight, Folder, File, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TreeContext = React.createContext(null);
const useTree = () => {
    const context = React.useContext(TreeContext);
    if (!context) throw new Error("Tree components must be used within TreeProvider");
    return context;
};

export const TreeProvider = ({
    children,
    defaultExpandedIds = [],
    selectedIds = [],
    onSelectionChange,
    onNodeClick,
    showLines = true,
    showIcons = true,
    selectable = true,
    multiSelect = true,
    animateExpand = true,
    indent = 16,
    className = "",
    ...props
}) => {
    const [expandedIds, setExpandedIds] = React.useState(new Set(defaultExpandedIds));
    const [internalSelectedIds, setInternalSelectedIds] = React.useState(selectedIds);
    const isControlled = onSelectionChange !== undefined;
    const currentSelectedIds = isControlled ? selectedIds : internalSelectedIds;

    const toggleExpanded = React.useCallback((nodeId) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId);
            return newSet;
        });
    }, []);

    const handleSelection = React.useCallback((nodeId, ctrlKey = false) => {
        if (!selectable) return;
        let newSelection;
        if (multiSelect && ctrlKey) {
            newSelection = currentSelectedIds.includes(nodeId)
                ? currentSelectedIds.filter(id => id !== nodeId)
                : [...currentSelectedIds, nodeId];
        } else {
            newSelection = currentSelectedIds.includes(nodeId) ? [] : [nodeId];
        }
        isControlled ? onSelectionChange?.(newSelection) : setInternalSelectedIds(newSelection);
    }, [selectable, multiSelect, currentSelectedIds, isControlled, onSelectionChange]);

    return (
        <TreeContext.Provider value={{
            expandedIds, selectedIds: currentSelectedIds,
            toggleExpanded, handleSelection,
            showLines, showIcons, selectable, multiSelect, animateExpand, indent, onNodeClick
        }}>
            <div className={`w-full ${className}`} {...props}>
                {children}
            </div>
        </TreeContext.Provider>
    );
};

export const Tree = ({ className = "", children, ...props }) => (
    <div className={`space-y-0.5 ${className}`} {...props}>{children}</div>
);

export const TreeItem = ({
    nodeId, label, icon, data, level = 0,
    isLast = false, parentPath = [], hasChildren = false,
    children, onClick, className = "", ...props
}) => {
    const { expandedIds, selectedIds, toggleExpanded, handleSelection,
        showLines, showIcons, animateExpand, indent, onNodeClick } = useTree();

    const isExpanded = expandedIds.has(nodeId);
    const isSelected = selectedIds.includes(nodeId);

    const getDefaultIcon = () => hasChildren
        ? (isExpanded ? <FolderOpen className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5" />)
        : <File className="w-3.5 h-3.5" />;

    const handleClick = (e) => {
        if (hasChildren) toggleExpanded(nodeId);
        handleSelection(nodeId, e.ctrlKey || e.metaKey);
        onNodeClick?.(nodeId, data);
        onClick?.(e);
    };

    return (
        <div className="select-none">
            <motion.div
                className={`flex items-center py-1.5 px-2 cursor-pointer rounded-lg transition-colors relative
                    ${isSelected
                        ? 'bg-[#6EE7B7]/15 text-[#6EE7B7] border border-[#6EE7B7]/20'
                        : 'hover:bg-[#1A1A1A] text-[#94A3B8] hover:text-[#F1F5F9]'
                    } ${className}`}
                style={{ paddingLeft: level * indent + 8 }}
                onClick={handleClick}
                whileTap={{ scale: 0.98 }}
            >
                {/* Expand chevron */}
                <motion.div
                    className="flex items-center justify-center w-3.5 h-3.5 mr-1 shrink-0"
                    animate={{ rotate: hasChildren && isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {hasChildren
                        ? <ChevronRight className="w-3 h-3 text-[#444]" />
                        : <span className="w-3" />
                    }
                </motion.div>

                {/* Icon */}
                {showIcons && (
                    <span className={`mr-1.5 shrink-0 ${isSelected ? 'text-[#6EE7B7]' : 'text-[#555]'}`}>
                        {icon || getDefaultIcon()}
                    </span>
                )}

                {/* Label */}
                <span className="font-mono text-[11px] truncate flex-1">{label}</span>

                {/* Selected checkmark */}
                {isSelected && !hasChildren && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] shrink-0 ml-1" />
                )}
            </motion.div>

            {/* Children */}
            <AnimatePresence>
                {hasChildren && isExpanded && children && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: animateExpand ? 0.25 : 0, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};