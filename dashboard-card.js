// Dashboard Card Functional Component System

// Create a dashboard card element
function DashboardCard({
    title,
    icon,
    headerAction,
    content,
    className = '',
    id = '',
    loadingContent = true,
    elevation = 'normal', // normal, raised, floating
    gradient = null
}) {
    const card = document.createElement('div');
    card.className = `dashboard-card ${className} dashboard-card--${elevation}`;
    if (id) card.id = id;
    
    // Apply gradient if specified
    if (gradient) {
        card.style.background = gradient;
    }

    // Card Header
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const titleElement = document.createElement('h3');
    titleElement.innerHTML = `<i class="${icon}"></i> ${title}`;
    header.appendChild(titleElement);
    
    if (headerAction) {
        const action = document.createElement('a');
        action.href = headerAction.href;
        action.className = 'card-header-action';
        action.textContent = headerAction.text;
        header.appendChild(action);
    }
    
    card.appendChild(header);
    
    // Card Content
    const contentElement = document.createElement('div');
    contentElement.className = 'card-content';
    
    if (loadingContent && !content) {
        contentElement.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        `;
    } else if (content) {
        if (typeof content === 'string') {
            contentElement.innerHTML = content;
        } else {
            contentElement.appendChild(content);
        }
    }
    
    card.appendChild(contentElement);
    
    return card;
}

// Update card content helper function
function updateCardContent(cardId, newContent) {
    const card = document.getElementById(cardId);
    if (card) {
        const contentElement = card.querySelector('.card-content');
        if (contentElement) {
            if (typeof newContent === 'string') {
                contentElement.innerHTML = newContent;
            } else {
                contentElement.innerHTML = '';
                contentElement.appendChild(newContent);
            }
        }
    }
}

// Set card loading state helper function
function setCardLoading(cardId, isLoading) {
    const card = document.getElementById(cardId);
    if (card) {
        const contentElement = card.querySelector('.card-content');
        if (contentElement && isLoading) {
            contentElement.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            `;
        }
    }
}

// Enhanced Card Animations
function initCardAnimations() {
    const cards = document.querySelectorAll('.dashboard-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('card-animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach(card => {
        observer.observe(card);
    });
}

// Functional component creators for specialized cards
const createCharacterCard = (characters) => {
    let content = '';
    
    if (characters && characters.length > 0) {
        characters.slice(0, 3).forEach(character => {
            content += `
                <div class="character-preview-item">
                    <div>
                        <div class="character-preview-name">${character.name}</div>
                        <div class="character-preview-meta">
                            <span>Level ${character.level} ${character.race} ${character.class}</span>
                        </div>
                    </div>
                    <a href="character.html?id=${character.id}" class="character-preview-action">Play</a>
                </div>
            `;
        });
        
        if (characters.length > 3) {
            content += `<div class="more-text">+ ${characters.length - 3} more character(s)</div>`;
        }
    } else {
        content = `
            <div class="empty-state">
                <i class="fas fa-user-plus"></i>
                <p>No characters yet. Create your first one!</p>
                <a href="character_edit.php" class="empty-state-action">Create Character</a>
            </div>
        `;
    }
    
    return DashboardCard({
        title: 'Your Characters',
        icon: 'fas fa-user-shield',
        headerAction: { href: 'characters.html', text: 'View All' },
        content: content,
        id: 'characters-card',
        elevation: 'raised'
    });
};

const createCampaignCard = (campaigns) => {
    let content = '';
    
    if (campaigns && campaigns.length > 0) {
        campaigns.slice(0, 3).forEach(campaign => {
            content += `
                <div class="campaign-preview-item">
                    <div>
                        <div class="campaign-preview-name">${campaign.name}</div>
                        <div class="campaign-preview-meta">
                            <span>${campaign.player_count || 0} players</span>
                        </div>
                    </div>
                    <a href="campaigns.html?id=${campaign.id}" class="campaign-preview-action">View</a>
                </div>
            `;
        });
    } else {
        content = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No active campaigns.</p>
                <a href="campaigns.html" class="empty-state-action">Browse Campaigns</a>
            </div>
        `;
    }
    
    return DashboardCard({
        title: 'Active Campaigns',
        icon: 'fas fa-book-open',
        headerAction: { href: 'campaigns.html', text: 'View All' },
        content: content,
        id: 'campaigns-card',
        elevation: 'raised'
    });
};

const createRecentRollsCard = (rolls) => {
    let content = '';
    
    if (rolls && rolls.length > 0) {
        content = '<div class="rolls-list">';
        rolls.slice(0, 5).forEach(roll => {
            content += `
                <div class="roll-item">
                    <span class="roll-action">${roll.action}</span>
                    <span class="roll-result">${roll.total}</span>
                </div>
            `;
        });
        content += '</div>';
    } else {
        content = `
            <div class="empty-state">
                <i class="fas fa-dice"></i>
                <p>No recent dice rolls.</p>
                <a href="dice_roller.html" class="empty-state-action">Roll Some Dice</a>
            </div>
        `;
    }
    
    return DashboardCard({
        title: 'Recent Rolls',
        icon: 'fas fa-dice-d20',
        headerAction: { href: 'dice_roller.html', text: 'Roll Dice' },
        content: content,
        id: 'recent-rolls-card',
        elevation: 'raised'
    });
};

const createQuickActionsCard = (isDungeonMaster = false) => {
    let actionsHtml = `
        <div class="quick-actions-grid">
            <a href="character_edit.php" class="quick-action-item">
                <i class="fas fa-plus"></i>
                <span>New Character</span>
            </a>
            <a href="dice_roller.html" class="quick-action-item">
                <i class="fas fa-dice"></i>
                <span>Roll Dice</span>
            </a>
            <a href="campaigns.html" class="quick-action-item">
                <i class="fas fa-users"></i>
                <span>Join Campaign</span>
            </a>
            <a href="notes.html" class="quick-action-item">
                <i class="fas fa-sticky-note"></i>
                <span>Notes</span>
            </a>
    `;
    
    if (isDungeonMaster) {
        actionsHtml += `
            <a href="master_controls.html" class="quick-action-item" style="background: linear-gradient(135deg, #b8860b, #ffd700);">
                <i class="fas fa-crown"></i>
                <span>Master Controls</span>
            </a>
        `;
    }
    
    actionsHtml += '</div>';
    
    return DashboardCard({
        title: 'Quick Actions',
        icon: 'fas fa-bolt',
        content: actionsHtml,
        id: 'quick-actions-card',
        elevation: 'floating'
    });
};

// Export for use
window.DashboardCard = DashboardCard;
window.updateCardContent = updateCardContent;
window.setCardLoading = setCardLoading;
window.createCharacterCard = createCharacterCard;
window.createCampaignCard = createCampaignCard;
window.createRecentRollsCard = createRecentRollsCard;
window.createQuickActionsCard = createQuickActionsCard;
window.initCardAnimations = initCardAnimations;