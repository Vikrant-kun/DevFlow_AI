import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Hash, CheckCircle2, Trello } from "lucide-react";
import TopBar from "../components/TopBar";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

const Integrations = () => {
    const {
        user,
        isGithubConnected,
        repos,
        selectedRepo,
        setSelectedRepo,
        githubLoading,
        connectGithubPat,
        fetchRepos,
        getAuthToken
    } = useAuth();

    const { showToast } = useToast();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const [showGithubInput, setShowGithubInput] = useState(false);
    const [githubPAT, setGithubPAT] = useState("");
    const [isSavingGithub, setIsSavingGithub] = useState(false);

    const [showCreateRepo, setShowCreateRepo] = useState(false);
    const [newRepoName, setNewRepoName] = useState("");
    const [newRepoPrivate, setNewRepoPrivate] = useState(false);
    const [isCreatingRepo, setIsCreatingRepo] = useState(false);

    const [slackWebhook, setSlackWebhook] = useState("");
    const [isSlackConnected, setIsSlackConnected] = useState(false);
    const [showSlackInput, setShowSlackInput] = useState(false);
    const [isSavingSlack, setIsSavingSlack] = useState(false);

    const [notionToken, setNotionToken] = useState("");
    const [isNotionConnected, setIsNotionConnected] = useState(false);
    const [showNotionInput, setShowNotionInput] = useState(false);
    const [isSavingNotion, setIsSavingNotion] = useState(false);

    const [linearToken, setLinearToken] = useState("");
    const [isLinearConnected, setIsLinearConnected] = useState(false);
    const [showLinearInput, setShowLinearInput] = useState(false);
    const [isSavingLinear, setIsSavingLinear] = useState(false);

    const [jiraToken, setJiraToken] = useState("");
    const [jiraDomain, setJiraDomain] = useState("");
    const [isJiraConnected, setIsJiraConnected] = useState(false);
    const [showJiraInput, setShowJiraInput] = useState(false);
    const [isSavingJira, setIsSavingJira] = useState(false);

    // LOAD SETTINGS
    useEffect(() => {
        const loadOtherIntegrations = async () => {
            if (!user) return;

            try {
                const token = await getAuthToken();

                const res = await fetch(`${API_URL}/github/integration-settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) return;

                const settings = await res.json();

                if (settings?.slack_webhook_url) {
                    setSlackWebhook(settings.slack_webhook_url);
                    setIsSlackConnected(true);
                }

                if (settings?.notion_token) {
                    setNotionToken(settings.notion_token);
                    setIsNotionConnected(true);
                }

                if (settings?.linear_token) {
                    setLinearToken(settings.linear_token);
                    setIsLinearConnected(true);
                }

                if (settings?.jira_token) {
                    setJiraToken(settings.jira_token);
                    setIsJiraConnected(true);
                }

                if (settings?.jira_domain) setJiraDomain(settings.jira_domain);
            } catch (err) {
                console.error("Failed loading integration settings:", err);
            }
        };

        loadOtherIntegrations();
    }, [user]);

    const saveIntegrationSettings = async (body) => {
        const token = await getAuthToken();

        const res = await fetch(`${API_URL}/github/integration-settings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Failed saving settings");
    };

    const handleRepoSelect = async (fullName) => {
        const repoObj = { name: fullName.split("/")[1], full_name: fullName };

        setSelectedRepo(repoObj);

        try {
            const token = await getAuthToken();

            await fetch(`${API_URL}/github/select-repo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ repo_full_name: fullName })
            });

            showToast(`Active repo set to ${fullName}`, "success");
        } catch {
            showToast("Failed to save repo selection", "error");
        }
    };

    const handleCreateRepo = async () => {
        if (!newRepoName.trim()) return;

        setIsCreatingRepo(true);

        try {
            const token = await getAuthToken();

            const res = await fetch(`${API_URL}/github/repos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newRepoName.trim(),
                    private: newRepoPrivate
                })
            });

            if (!res.ok) throw new Error("Repo creation failed");

            const data = await res.json();

            await fetchRepos();

            setSelectedRepo({
                name: data.repo.name,
                full_name: data.repo.full_name
            });

            setShowCreateRepo(false);
            setNewRepoName("");

            showToast(`Repo "${data.repo.name}" created!`, "success");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setIsCreatingRepo(false);
        }
    };

    const handleSaveSlack = async () => {
        if (!slackWebhook.trim()) return;

        setIsSavingSlack(true);

        try {
            await saveIntegrationSettings({
                slack_webhook_url: slackWebhook.trim()
            });

            setIsSlackConnected(true);
            setShowSlackInput(false);

            showToast("Slack connected!", "success");
        } catch {
            showToast("Failed to save Slack webhook", "error");
        } finally {
            setIsSavingSlack(false);
        }
    };

    const handleSaveNotion = async () => {
        if (!notionToken.trim()) return;

        setIsSavingNotion(true);

        try {
            await saveIntegrationSettings({
                notion_token: notionToken.trim()
            });

            setIsNotionConnected(true);
            setShowNotionInput(false);

            showToast("Notion connected!", "success");
        } catch {
            showToast("Failed to save Notion token", "error");
        } finally {
            setIsSavingNotion(false);
        }
    };

    const handleSaveLinear = async () => {
        if (!linearToken.trim()) return;

        setIsSavingLinear(true);

        try {
            await saveIntegrationSettings({
                linear_token: linearToken.trim()
            });

            setIsLinearConnected(true);
            setShowLinearInput(false);

            showToast("Linear connected!", "success");
        } catch {
            showToast("Failed to save Linear token", "error");
        } finally {
            setIsSavingLinear(false);
        }
    };

    const handleSaveJira = async () => {
        if (!jiraToken.trim() || !jiraDomain.trim()) return;

        setIsSavingJira(true);

        try {
            await saveIntegrationSettings({
                jira_token: jiraToken.trim(),
                jira_domain: jiraDomain.trim()
            });

            setIsJiraConnected(true);
            setShowJiraInput(false);

            showToast("Jira connected!", "success");
        } catch {
            showToast("Failed to save Jira credentials", "error");
        } finally {
            setIsSavingJira(false);
        }
    };

    const disconnectGithub = async () => {
        try {
            const token = await getAuthToken();

            await fetch(`${API_URL}/github/disconnect`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            window.location.reload();
        } catch {
            showToast("Failed to disconnect GitHub", "error");
        }
    };

    const integrations = [
        {
            id: "github",
            name: "GitHub",
            desc: "Trigger workflows from PRs, merges, and issues.",
            icon: Github,
            connected: isGithubConnected
        },
        {
            id: "slack",
            name: "Slack",
            desc: "Send notifications and alerts to channels.",
            icon: Hash,
            connected: isSlackConnected
        },
        {
            id: "notion",
            name: "Notion",
            desc: "Create pages and update databases automatically.",
            icon: CheckCircle2,
            connected: isNotionConnected
        },
        {
            id: "linear",
            name: "Linear",
            desc: "Create issues and manage cycles automatically.",
            icon: Trello,
            connected: isLinearConnected
        },
        {
            id: "jira",
            name: "Jira",
            desc: "Sync issues, epic status, and bug reports.",
            icon: Trello,
            connected: isJiraConnected
        }
    ];

    return (
        <>
            <TopBar
                title={
                    <span className="font-mono text-sm text-[#6EE7B7]">
                        ~ / integrations
                    </span>
                }
            />

            <div className="p-6">
                <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {integrations.map((integration) => {
                            const Icon = integration.icon;

                            return (
                                <motion.div
                                    key={integration.id}
                                    variants={itemVariants}
                                    className="bg-[#111] border border-[#222] rounded-xl p-6"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4 items-center">
                                            <Icon className="w-6 h-6 text-white" />

                                            <div>
                                                <h3 className="text-white font-mono">
                                                    {integration.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 font-mono">
                                                    {integration.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {integration.connected ? (
                                        <div className="flex justify-between items-center mt-6">
                                            <span className="text-green-400 text-xs font-mono">
                                                connected
                                            </span>

                                            {integration.id === "github" ? (
                                                <button
                                                    onClick={disconnectGithub}
                                                    className="text-red-400 text-xs font-mono"
                                                >
                                                    Disconnect
                                                </button>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (integration.id === "slack")
                                                    setShowSlackInput(true);

                                                if (integration.id === "notion")
                                                    setShowNotionInput(true);

                                                if (integration.id === "linear")
                                                    setShowLinearInput(true);

                                                if (integration.id === "jira")
                                                    setShowJiraInput(true);

                                                if (integration.id === "github")
                                                    setShowGithubInput(true);
                                            }}
                                            className="mt-6 bg-[#6EE7B7] text-black px-4 py-2 rounded-xl text-xs font-bold font-mono"
                                        >
                                            Connect
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default Integrations;