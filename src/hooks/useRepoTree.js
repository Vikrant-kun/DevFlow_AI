import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export const useRepoTree = (getAuthToken, selectedRepo) => {
    const [tree, setTree] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!selectedRepo) return;
        const fetchTree = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await apiFetch('/github/repo-tree/', {}, getAuthToken);
                setTree(data.files || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTree();
    }, [selectedRepo]);

    // Convert flat file list to nested tree structure
    const buildTree = (files) => {
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

    return { tree, nestedTree: buildTree(tree), isLoading, error };
};