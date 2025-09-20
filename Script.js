document.addEventListener('DOMContentLoaded', () => {
    const mainTabs = document.querySelectorAll('[data-main-tab]');
    const subTabContainers = document.querySelectorAll('.sub-tab-container');
    const contentSections = document.querySelectorAll('.content-section');
    const modal = document.getElementById('code-preview-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const codePreviewTitle = document.getElementById('code-preview-title');
    const codeBlock = document.getElementById('code-block');

    // Function to handle switching main tabs
    function switchMainTab(targetTab) {
        // Update active state on main tabs
        mainTabs.forEach(tab => tab.classList.toggle('active', tab === targetTab));

        const targetId = targetTab.dataset.mainTab;

        // Open the correct sub-tab container
        subTabContainers.forEach(container => {
            container.classList.toggle('open', container.id === `sub-tabs-${targetId}`);
        });
        
        // Activate the first sub-tab in the newly opened container
        const firstSubTab = document.querySelector(`#sub-tabs-${targetId} .sub-tab`);
        if (firstSubTab) {
            switchContent(firstSubTab);
        }
    }
    
    // Function to handle switching content based on sub-tab clicks
    function switchContent(targetSubTab) {
        // Update active state for all sub-tabs within the same parent
        const parentContainer = targetSubTab.closest('.sub-tab-container');
        parentContainer.querySelectorAll('.sub-tab').forEach(sub => sub.classList.remove('active'));
        targetSubTab.classList.add('active');

        // Show the correct content section
        const contentId = targetSubTab.dataset.contentId;
        contentSections.forEach(section => {
            section.classList.toggle('visible', section.id === contentId);
        });
    }

    // Event listener for main tab clicks
    document.getElementById('main-tabs').addEventListener('click', (e) => {
        if (e.target.matches('[data-main-tab]')) {
            switchMainTab(e.target);
        }
    });
    
    // Event listener for sub-tab clicks (delegated)
    document.querySelector('.container').addEventListener('click', (e) => {
         if (e.target.matches('.sub-tab')) {
            switchContent(e.target);
        }
    });
    
    // --- Modal Logic ---
    function showModal(title, code) {
        codePreviewTitle.textContent = title;
        codeBlock.textContent = code;
        // Note: For syntax highlighting, you would use a library like highlight.js here
        modal.classList.add('visible');
    }

    function hideModal() {
        modal.classList.remove('visible');
    }

    document.getElementById('content-area').addEventListener('click', (e) => {
        if(e.target.classList.contains('view-code-btn')) {
            const title = e.target.dataset.codeFile;
            // In a real site, you'd fetch this from the file path.
            // For this demo, we use placeholder text based on the button clicked.
            const sampleCode = getSampleCode(title);
            showModal(title, sampleCode);
        }
    });

    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        // Close if clicking on the background overlay
        if (e.target === modal) {
            hideModal();
        }
    });

    function getSampleCode(filePath) {
        const codeMap = {
            '/school/graph-solver.js': `// FILE: /algorithms/graph.js
class Graph {
    constructor() { this.adjacencyList = {}; }
    addVertex(vertex) { if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = []; }
    addEdge(v1, v2) { this.adjacencyList[v1].push(v2); this.adjacencyList[v2].push(v1); }
}
function solveMaze(mazeData) { console.log('Solving maze...'); return "Path found!"; }`,

            '/games/rpg-engine.js': `// FILE: /games/rpg-engine.js
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

class Player {
    constructor(x, y) { this.x = x; this.y = y; this.health = 100; }
    draw() { ctx.fillStyle = 'blue'; ctx.fillRect(this.x, this.y, 20, 20); }
}
function gameLoop() { requestAnimationFrame(gameLoop); }`,

            '/bots/moderator.js': `// FILE: /bots/moderator.js
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('ready', () => {
    console.log(\`Logged in as \${client.user.tag}!\`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    // ... command logic
});

client.login('YOUR_TOKEN_HERE');`,

            '/misc/pi-setup.sh': `#!/bin/bash
# Raspberry Pi Web Server Setup Script
echo "Updating package lists..."
sudo apt-get update

echo "Installing Nginx..."
sudo apt-get install nginx -y

echo "Enabling Nginx to start on boot..."
sudo systemctl enable nginx

echo "Setup complete!"`
        };
        return codeMap[filePath] || "Code not found for this project.";
    }

    // Initialize view
    switchMainTab(document.querySelector('[data-main-tab].active'));
});
