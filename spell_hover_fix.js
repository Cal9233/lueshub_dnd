// Direct spell hover fix - separate file to avoid conflicts
document.addEventListener('DOMContentLoaded', function() {
    // Wait for everything to be fully loaded
    setTimeout(function() {
        console.log("SpellHoverFix: Applying direct hover fix");
        
        // Apply a direct style fix for hover that bypasses any other CSS
        const directHoverFix = document.createElement('style');
        directHoverFix.id = 'super-direct-hover-fix';
        directHoverFix.innerHTML = `
            /* Ultra-direct spell tooltip hover fix */
            .spell-item {
                position: relative !important;
                transition: none !important;
            }
            
            .spell-detail-tooltip {
                position: absolute !important;
                left: 105% !important;
                top: 0 !important;
                width: 350px !important;
                background: #2f3136 !important;
                color: white !important;
                border: 2px solid #7289da !important;
                padding: 15px !important;
                border-radius: 8px !important;
                box-shadow: 0 0 10px rgba(0,0,0,0.5) !important;
                z-index: 999999 !important;
                display: none !important;
                pointer-events: none !important;
            }
            
            .spell-detail-tooltip h3,
            .spell-detail-tooltip h4,
            .spell-detail-tooltip div,
            .spell-detail-tooltip p,
            .spell-detail-tooltip span {
                color: white !important;
            }
            
            .spell-item:hover .spell-detail-tooltip {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(directHoverFix);
        
        // Add a manual hover handler to each spell item
        function applyHoverHandlers() {
            const spellItems = document.querySelectorAll('.spell-item');
            
            spellItems.forEach(item => {
                // Mark as having the handler
                if (item.dataset.hasHoverHandler) return;
                item.dataset.hasHoverHandler = 'true';
                
                const tooltip = item.querySelector('.spell-detail-tooltip');
                if (!tooltip) return;
                
                // Mouse enter handler
                item.addEventListener('mouseenter', function() {
                    console.log("SpellHoverFix: Spell mouseenter");
                    tooltip.style.display = 'block';
                    tooltip.style.visibility = 'visible';
                    tooltip.style.opacity = '1';
                    tooltip.style.pointerEvents = 'auto';
                });
                
                // Mouse leave handler
                item.addEventListener('mouseleave', function() {
                    console.log("SpellHoverFix: Spell mouseleave");
                    // Only hide if we're not in "show all" mode
                    const spellList = document.getElementById('spellList');
                    if (spellList && spellList.dataset.displaySpellDetails !== 'true') {
                        tooltip.style.display = '';
                    }
                });
            });
        }
        
        // Apply hover handlers now and every few seconds in case spells are updated
        applyHoverHandlers();
        setInterval(applyHoverHandlers, 3000);
        
        // Force reapply hover handlers when spells list changes
        const spellList = document.getElementById('spellList');
        if (spellList) {
            // Create observer to watch for changes to spell list
            const observer = new MutationObserver(function(mutations) {
                console.log("SpellHoverFix: Spell list changed, reapplying hover handlers");
                setTimeout(applyHoverHandlers, 100);
            });
            
            observer.observe(spellList, {
                childList: true,
                subtree: true
            });
        }
        
        // Add a special trigger button
        const triggerButtonContainer = document.createElement('div');
        triggerButtonContainer.style.position = 'fixed';
        triggerButtonContainer.style.bottom = '10px';
        triggerButtonContainer.style.left = '10px';
        triggerButtonContainer.style.zIndex = '9999';
        
        const triggerButton = document.createElement('button');
        triggerButton.textContent = 'Reload Tooltips';
        triggerButton.style.padding = '5px 10px';
        triggerButton.style.backgroundColor = '#7289da';
        triggerButton.style.color = 'white';
        triggerButton.style.border = 'none';
        triggerButton.style.borderRadius = '4px';
        triggerButton.style.cursor = 'pointer';
        
        triggerButton.addEventListener('click', function() {
            console.log("SpellHoverFix: Manual trigger clicked");
            
            // Remove and reapply all styles
            const oldStyle = document.getElementById('super-direct-hover-fix');
            if (oldStyle) oldStyle.remove();
            document.head.appendChild(directHoverFix);
            
            // Force reapply all handlers
            applyHoverHandlers();
            
            // Apply inline styles directly to all tooltips
            document.querySelectorAll('.spell-detail-tooltip').forEach(tooltip => {
                tooltip.style.position = 'absolute';
                tooltip.style.left = '105%';
                tooltip.style.top = '0';
                tooltip.style.width = '350px';
                tooltip.style.backgroundColor = '#2f3136';
                tooltip.style.color = 'white';
                tooltip.style.border = '2px solid #7289da';
                tooltip.style.padding = '15px';
                tooltip.style.borderRadius = '8px';
                tooltip.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
                tooltip.style.zIndex = '999999';
            });
            
            // Show confirmation
            alert('Tooltips reloaded. Hover should now work.');
        });
        
        triggerButtonContainer.appendChild(triggerButton);
        document.body.appendChild(triggerButtonContainer);
        
        console.log("SpellHoverFix: Direct hover fix applied");
    }, 3000);
});