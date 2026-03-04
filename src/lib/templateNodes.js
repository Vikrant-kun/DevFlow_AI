export const templateNodesData = {
    'deploy-pipeline': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'Push to Main', description: 'Triggers when code is merged or pushed to main branch', icon: 'git-branch' } },
            { id: '2', type: 'custom', position: { x: 450, y: 250 }, data: { type: 'action', label: 'Run Unit Tests', description: 'Execute Jest test suite', icon: 'zap' } },
            { id: '3', type: 'custom', position: { x: 800, y: 250 }, data: { type: 'action', label: 'Build Docker Image', description: 'Build and tag container image', icon: 'database' } },
            { id: '4', type: 'custom', position: { x: 1150, y: 250 }, data: { type: 'action', label: 'Deploy to ECS', description: 'Update ECS service with new image', icon: 'play' } },
            { id: '5', type: 'custom', position: { x: 1500, y: 250 }, data: { type: 'notification', label: 'Notify Engineering', description: 'Alert #engineering channel on success/fail', icon: 'mail' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e4-5', source: '4', target: '5' }
        ]
    },
    'code-review-automation': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'PR Opened', description: 'Triggers when a new Pull Request is opened', icon: 'git-branch' } },
            { id: '2', type: 'custom', position: { x: 450, y: 250 }, data: { type: 'action', label: 'Fetch PR Diff', description: 'Get changed files and lines', icon: 'code' } },
            { id: '3', type: 'custom', position: { x: 800, y: 250 }, data: { type: 'ai', label: 'Claude Review', description: 'Analyze code for bugs and style issues', icon: 'sparkles' } },
            { id: '4', type: 'custom', position: { x: 1150, y: 250 }, data: { type: 'action', label: 'Post Comments', description: 'Add line-by-line review comments to GitHub PR', icon: 'mail' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' }
        ]
    },
    'release-notes-generator': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'Release Tagged', description: 'Triggers on new semantic version tag', icon: 'play' } },
            { id: '2', type: 'custom', position: { x: 450, y: 250 }, data: { type: 'action', label: 'Get Commits', description: 'Fetch commits since last release tag', icon: 'code' } },
            { id: '3', type: 'custom', position: { x: 800, y: 250 }, data: { type: 'ai', label: 'Draft Release Notes', description: 'Categorize features and fixes into readable format', icon: 'sparkles' } },
            { id: '4', type: 'custom', position: { x: 1150, y: 250 }, data: { type: 'action', label: 'Publish Release', description: 'Create GitHub release draft', icon: 'database' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' }
        ]
    },
    'bug-report-handler': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'Bug Created', description: 'Triggers when issue labeled "bug" is opened', icon: 'code' } },
            { id: '2', type: 'custom', position: { x: 450, y: 250 }, data: { type: 'ai', label: 'Triage Priority', description: 'Determine severity based on text description', icon: 'sparkles' } },
            { id: '3', type: 'custom', position: { x: 800, y: 250 }, data: { type: 'action', label: 'Create Jira Ticket', description: 'Mirror bug to internal tracker', icon: 'database' } },
            { id: '4', type: 'custom', position: { x: 1150, y: 250 }, data: { type: 'notification', label: 'Alert On-Call', description: 'Page PagerDuty if critical', icon: 'mail' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' }
        ]
    },
    'pr-review-reminder': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'Schedule: Daily', description: 'Runs every day at 9:00 AM', icon: 'zap' } },
            { id: '2', type: 'custom', position: { x: 450, y: 250 }, data: { type: 'action', label: 'Find Stale PRs', description: 'Query PRs open > 48hrs without review', icon: 'database' } },
            { id: '3', type: 'custom', position: { x: 800, y: 250 }, data: { type: 'notification', label: 'DM Reviewers', description: 'Send Slack messages to assigned reviewers', icon: 'mail' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' }
        ]
    },
    'staging-environment-sync': {
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 250 }, data: { type: 'trigger', label: 'Schedule: Nightly', description: 'Runs every night at 2:00 AM', icon: 'zap' } },
            { id: '2', type: 'custom', position: { x: 450, y: 250 }, data: { type: 'action', label: 'Snapshot Production', description: 'Create database backup', icon: 'database' } },
            { id: '3', type: 'custom', position: { x: 800, y: 250 }, data: { type: 'ai', label: 'Scrub PII', description: 'Detect & anonymize sensitive user data', icon: 'sparkles' } },
            { id: '4', type: 'custom', position: { x: 1150, y: 250 }, data: { type: 'action', label: 'Restore to Staging', description: 'Load anonymized db to staging environment', icon: 'play' } },
            { id: '5', type: 'custom', position: { x: 1500, y: 250 }, data: { type: 'notification', label: 'Slack Alert', description: 'Notify QA team data is fresh', icon: 'mail' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' },
            { id: 'e3-4', source: '3', target: '4' },
            { id: 'e4-5', source: '4', target: '5' }
        ]
    }
};
