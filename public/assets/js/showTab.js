function showTab(tabId) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    // Remove active class from all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    // Add active class to the clicked tab
    document.querySelector(`.tab[onclick="showTab('${tabId}')"]`).classList.add('active');
    // Add active class to the corresponding tab content
    document.getElementById(tabId).classList.add('active');
}

// Expose it globally
window.showTab = showTab;