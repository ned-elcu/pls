/**
 * Admin Dashboard Helper Functions
 * This file contains implementations for all the missing functions in the admin dashboard.
 * 
 * To use: Add this script tag before the closing body tag in admin.html:
 * <script src="admin-functions.js"></script>
 */

// =============================================
// Template Management Functions
// =============================================

// Show the template modal for creating a new template
function showNewTemplateModal() {
    // Reset form
    templateForm.reset();
    
    // Set modal title for new template
    templateModalTitle.textContent = 'Adaugă șablon nou';
    
    // Reset editing ID
    editingTemplateId = null;
    
    // Show modal
    templateModal.classList.add('show');
}

// Hide the template modal
function hideTemplateModal() {
    templateModal.classList.remove('show');
}

// Save template (create new or update existing)
function saveTemplate() {
    // Get form values
    const title = templateTitle.value.trim();
    const category = templateCategory.value;
    const content = templateContent.value.trim();
    
    // Validate form
    if (!title || !content) {
        alert('Vă rugăm să completați toate câmpurile obligatorii.');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Prepare template data
    const templateData = {
        title: title,
        category: category,
        content: content,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Create new or update existing template
    let savePromise;
    
    if (editingTemplateId) {
        // Update existing template
        savePromise = db.collection('templates').doc(editingTemplateId).update(templateData);
    } else {
        // Add creation timestamp for new templates
        templateData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        templateData.createdBy = currentUser.uid;
        
        // Create new template
        savePromise = db.collection('templates').add(templateData);
    }
    
    savePromise
        .then(() => {
            // Hide modal
            hideTemplateModal();
            
            // Reload templates
            loadTemplatesData();
            
            // Hide loading
            hideLoading();
        })
        .catch(error => {
            console.error('Error saving template:', error);
            alert('Eroare la salvarea șablonului. Vă rugăm să încercați din nou.');
            hideLoading();
        });
}

// Filter templates based on search and category
function filterTemplates() {
    const searchTerm = templateSearch.value.toLowerCase();
    const categoryFilter = templateCategoryFilter.value;
    
    // Show loading
    showLoading();
    
    // Prepare query
    let query = db.collection('templates');
    
    if (categoryFilter !== 'all') {
        query = query.where('category', '==', categoryFilter);
    }
    
    // Execute query
    query.get()
        .then(snapshot => {
            // Clear container
            templatesGrid.innerHTML = '';
            
            if (snapshot.empty) {
                templatesGrid.innerHTML = `
                    <div style="padding: 2rem; text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">
                        <p>Nu există șabloane în această categorie.</p>
                    </div>
                `;
                hideLoading();
                return;
            }
            
            // Filter templates by search term
            const templates = [];
            snapshot.forEach(doc => {
                const template = {
                    id: doc.id,
                    ...doc.data()
                };
                
                // Apply search filter if needed
                if (!searchTerm || 
                    template.title.toLowerCase().includes(searchTerm) || 
                    template.content.toLowerCase().includes(searchTerm)) {
                    templates.push(template);
                }
            });
            
            // Check if any templates match the filters
            if (templates.length === 0) {
                templatesGrid.innerHTML = `
                    <div style="padding: 2rem; text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">
                        <p>Nu s-au găsit șabloane care să corespundă filtrelor.</p>
                    </div>
                `;
                hideLoading();
                return;
            }
            
            // Display templates
            templates.forEach(template => {
                const templateCard = document.createElement('div');
                templateCard.className = 'template-card';
                
                templateCard.innerHTML = `
                    <div class="template-content">
                        <h4 style="margin-bottom: 0.5rem;">${template.title}</h4>
                        <div style="white-space: pre-wrap;">${template.content}</div>
                    </div>
                    <div class="template-actions">
                        <span class="template-category">${getCategoryName(template.category)}</span>
                        <div>
                            <button class="template-action" data-action="edit" data-id="${template.id}" title="Editează">
                                <i class="material-icons">edit</i>
                            </button>
                            <button class="template-action" data-action="delete" data-id="${template.id}" title="Șterge">
                                <i class="material-icons">delete</i>
                            </button>
                        </div>
                    </div>
                `;
                
                // Add edit and delete handlers
                templateCard.querySelector('[data-action="edit"]').addEventListener('click', () => {
                    editTemplate(template.id);
                });
                
                templateCard.querySelector('[data-action="delete"]').addEventListener('click', () => {
                    deleteTemplate(template.id);
                });
                
                templatesGrid.appendChild(templateCard);
            });
            
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading templates:', error);
            templatesGrid.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">
                    <p>Eroare la încărcarea șabloanelor. Vă rugăm să încercați din nou.</p>
                </div>
            `;
            hideLoading();
        });
}

// Get category name from ID
function getCategoryName(categoryId) {
    const categories = {
        'greeting': 'Salut',
        'info': 'Informații',
        'traffic': 'Circulație',
        'complaint': 'Reclamații',
        'emergency': 'Urgențe',
        'closing': 'Încheiere'
    };
    
    return categories[categoryId] || categoryId;
}

// Edit a template
function editTemplate(templateId) {
    // Show loading
    showLoading();
    
    // Get template data
    db.collection('templates').doc(templateId).get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error('Template not found');
            }
            
            const template = doc.data();
            
            // Set form values
            templateTitle.value = template.title || '';
            templateCategory.value = template.category || 'greeting';
            templateContent.value = template.content || '';
            
            // Set editing ID
            editingTemplateId = templateId;
            
            // Set modal title
            templateModalTitle.textContent = 'Editează șablon';
            
            // Show modal
            templateModal.classList.add('show');
            
            // Hide loading
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading template for editing:', error);
            alert('Eroare la încărcarea șablonului pentru editare. Vă rugăm să încercați din nou.');
            hideLoading();
        });
}

// Delete a template
function deleteTemplate(templateId) {
    if (confirm('Sigur doriți să ștergeți acest șablon?')) {
        // Show loading
        showLoading();
        
        // Delete template
        db.collection('templates').doc(templateId).delete()
            .then(() => {
                // Reload templates
                loadTemplatesData();
                
                // Hide loading
                hideLoading();
            })
            .catch(error => {
                console.error('Error deleting template:', error);
                alert('Eroare la ștergerea șablonului. Vă rugăm să încercați din nou.');
                hideLoading();
            });
    }
}

// Load templates data
function loadTemplatesData() {
    // Show loading
    showLoading();
    
    // Reset filters
    templateSearch.value = '';
    templateCategoryFilter.value = 'all';
    
    // Load templates
    db.collection('templates')
        .orderBy('createdAt', 'desc')
        .get()
        .then(snapshot => {
            // Clear container
            templatesGrid.innerHTML = '';
            
            if (snapshot.empty) {
                templatesGrid.innerHTML = `
                    <div style="padding: 2rem; text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">
                        <p>Nu există șabloane. Adăugați primul șablon folosind butonul de mai sus.</p>
                    </div>
                `;
                hideLoading();
                return;
            }
            
            // Display templates
            snapshot.forEach(doc => {
                const template = doc.data();
                const templateId = doc.id;
                
                const templateCard = document.createElement('div');
                templateCard.className = 'template-card';
                
                templateCard.innerHTML = `
                    <div class="template-content">
                        <h4 style="margin-bottom: 0.5rem;">${template.title}</h4>
                        <div style="white-space: pre-wrap;">${template.content}</div>
                    </div>
                    <div class="template-actions">
                        <span class="template-category">${getCategoryName(template.category)}</span>
                        <div>
                            <button class="template-action" data-action="edit" data-id="${templateId}" title="Editează">
                                <i class="material-icons">edit</i>
                            </button>
                            <button class="template-action" data-action="delete" data-id="${templateId}" title="Șterge">
                                <i class="material-icons">delete</i>
                            </button>
                        </div>
                    </div>
                `;
                
                // Add edit and delete handlers
                templateCard.querySelector('[data-action="edit"]').addEventListener('click', () => {
                    editTemplate(templateId);
                });
                
                templateCard.querySelector('[data-action="delete"]').addEventListener('click', () => {
                    deleteTemplate(templateId);
                });
                
                templatesGrid.appendChild(templateCard);
            });
            
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading templates:', error);
            templatesGrid.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">
                    <p>Eroare la încărcarea șabloanelor. Vă rugăm să încercați din nou.</p>
                </div>
            `;
            hideLoading();
        });
}

// =============================================
// User Management Functions
// =============================================

// Show user modal for creating a new user
function showNewUserModal() {
    // Reset form
    userForm.reset();
    
    // Set modal title
    userModalTitle.textContent = 'Adaugă utilizator nou';
    
    // Reset editing ID
    editingUserId = null;
    
    // Show modal
    userModal.classList.add('show');
}

// Hide user modal
function hideUserModal() {
    userModal.classList.remove('show');
}

// Save user (create new or update existing)
function saveUser() {
    // Get form values
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const department = document.getElementById('userDepartment').value;
    const twoFactorEnabled = document.getElementById('userTwoFactorAuth').checked;
    
    // Validate form
    if (!name || !email || (!editingUserId && !password)) {
        alert('Vă rugăm să completați toate câmpurile obligatorii.');
        return;
    }
    
    // Show loading
    showLoading();
    
    if (editingUserId) {
        // Update existing user
        const userData = {
            displayName: name,
            role: role,
            department: department,
            twoFactorEnabled: twoFactorEnabled,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Update in Firestore
        db.collection('users').doc(editingUserId).update(userData)
            .then(() => {
                // If password was changed, update auth
                if (password) {
                    // This would typically be done through a secure Cloud Function
                    // For demo purposes, we'll just show a message
                    console.log('Password change would be handled by a Cloud Function in a real app');
                }
                
                // Hide modal and reload users
                hideUserModal();
                loadUsersData();
                hideLoading();
            })
            .catch(error => {
                console.error('Error updating user:', error);
                alert('Eroare la actualizarea utilizatorului. Vă rugăm să încercați din nou.');
                hideLoading();
            });
    } else {
        // Create new user
        // In a real application, this would be done through a secure Cloud Function
        // For demo purposes, we'll implement a simplified version
        
        // Create auth user
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const newUser = userCredential.user;
                
                // Create user document
                return db.collection('users').doc(newUser.uid).set({
                    displayName: name,
                    email: email,
                    role: role,
                    department: department,
                    twoFactorEnabled: twoFactorEnabled,
                    active: true,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdBy: currentUser.uid
                });
            })
            .then(() => {
                // Hide modal and reload users
                hideUserModal();
                loadUsersData();
                hideLoading();
                
                // Show success message
                alert('Utilizator creat cu succes.');
            })
            .catch(error => {
                console.error('Error creating user:', error);
                
                // Show appropriate error message
                if (error.code === 'auth/email-already-in-use') {
                    alert('Adresa de email este deja utilizată.');
                } else if (error.code === 'auth/weak-password') {
                    alert('Parola este prea slabă. Vă rugăm să alegeți o parolă mai puternică.');
                } else {
                    alert('Eroare la crearea utilizatorului. Vă rugăm să încercați din nou.');
                }
                
                hideLoading();
            });
    }
}

// Filter users based on search and role
function filterUsers() {
    const searchTerm = userSearch.value.toLowerCase();
    const roleFilter = userRoleFilter.value;
    
    // Show loading
    showLoading();
    
    // Prepare query
    let query = db.collection('users');
    
    if (roleFilter !== 'all') {
        query = query.where('role', '==', roleFilter);
    }
    
    // Execute query
    query.get()
        .then(snapshot => {
            // Clear container
            usersTable.innerHTML = '';
            
            if (snapshot.empty) {
                usersTable.innerHTML = `
                    <tr>
                        <td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                            Nu există utilizatori care să corespundă filtrelor.
                        </td>
                    </tr>
                `;
                hideLoading();
                return;
            }
            
            // Filter users by search term
            const users = [];
            snapshot.forEach(doc => {
                const user = {
                    id: doc.id,
                    ...doc.data()
                };
                
                // Apply search filter if needed
                if (!searchTerm || 
                    (user.displayName && user.displayName.toLowerCase().includes(searchTerm)) || 
                    (user.email && user.email.toLowerCase().includes(searchTerm))) {
                    users.push(user);
                }
            });
            
            // Check if any users match the filters
            if (users.length === 0) {
                usersTable.innerHTML = `
                    <tr>
                        <td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                            Nu s-au găsit utilizatori care să corespundă filtrelor.
                        </td>
                    </tr>
                `;
                hideLoading();
                return;
            }
            
            // Display users
            users.forEach(user => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td style="padding: 1rem; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${user.displayName || ''}
                    </td>
                    <td style="padding: 1rem; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${user.email || ''}
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${getRoleName(user.role)}
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${getDepartmentName(user.department)}
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        <span style="display: inline-block; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; ${user.active ? 'background-color: rgba(76, 175, 80, 0.2); color: var(--success-color);' : 'background-color: rgba(244, 67, 54, 0.2); color: var(--danger-color);'}">
                            ${user.active ? 'Activ' : 'Inactiv'}
                        </span>
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        <button class="btn btn-secondary" style="padding: 0.5rem; margin-right: 0.5rem;" onclick="editUser('${user.id}')">
                            <i class="material-icons">edit</i>
                        </button>
                        <button class="btn ${user.active ? 'btn-secondary' : 'btn-primary'}" style="padding: 0.5rem;" onclick="toggleUserStatus('${user.id}', ${!user.active})">
                            <i class="material-icons">${user.active ? 'block' : 'check'}</i>
                        </button>
                    </td>
                `;
                
                usersTable.appendChild(row);
            });
            
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading users:', error);
            usersTable.innerHTML = `
                <tr>
                    <td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                        Eroare la încărcarea utilizatorilor. Vă rugăm să încercați din nou.
                    </td>
                </tr>
            `;
            hideLoading();
        });
}

// Edit user
function editUser(userId) {
    // Show loading
    showLoading();
    
    // Get user data
    db.collection('users').doc(userId).get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error('User not found');
            }
            
            const user = doc.data();
            
            // Set form values
            document.getElementById('userName').value = user.displayName || '';
            document.getElementById('userEmail').value = user.email || '';
            document.getElementById('userPassword').value = ''; // Don't show password
            document.getElementById('userRole').value = user.role || 'agent';
            document.getElementById('userDepartment').value = user.department || 'general';
            document.getElementById('userTwoFactorAuth').checked = user.twoFactorEnabled || false;
            
            // Set editing ID
            editingUserId = userId;
            
            // Set modal title
            userModalTitle.textContent = 'Editează utilizator';
            
            // Show modal
            userModal.classList.add('show');
            
            // Hide loading
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading user for editing:', error);
            alert('Eroare la încărcarea utilizatorului pentru editare. Vă rugăm să încercați din nou.');
            hideLoading();
        });
}

// Toggle user status (active/inactive)
function toggleUserStatus(userId, active) {
    // Show loading
    showLoading();
    
    // Update user status
    db.collection('users').doc(userId).update({
        active: active,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        // Reload users
        loadUsersData();
        
        // Hide loading
        hideLoading();
    })
    .catch(error => {
        console.error('Error updating user status:', error);
        alert('Eroare la actualizarea statusului utilizatorului. Vă rugăm să încercați din nou.');
        hideLoading();
    });
}

// Load users data
function loadUsersData() {
    // Show loading
    showLoading();
    
    // Reset filters
    userSearch.value = '';
    userRoleFilter.value = 'all';
    
    // Load users
    db.collection('users')
        .orderBy('displayName')
        .get()
        .then(snapshot => {
            // Clear container
            usersTable.innerHTML = '';
            
            if (snapshot.empty) {
                usersTable.innerHTML = `
                    <tr>
                        <td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                            Nu există utilizatori. Adăugați primul utilizator folosind butonul de mai sus.
                        </td>
                    </tr>
                `;
                hideLoading();
                return;
            }
            
            // Display users
            snapshot.forEach(doc => {
                const user = doc.data();
                const userId = doc.id;
                
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td style="padding: 1rem; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${user.displayName || ''}
                    </td>
                    <td style="padding: 1rem; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${user.email || ''}
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${getRoleName(user.role)}
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${getDepartmentName(user.department)}
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        <span style="display: inline-block; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; ${user.active ? 'background-color: rgba(76, 175, 80, 0.2); color: var(--success-color);' : 'background-color: rgba(244, 67, 54, 0.2); color: var(--danger-color);'}">
                            ${user.active ? 'Activ' : 'Inactiv'}
                        </span>
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        <button class="btn btn-secondary" style="padding: 0.5rem; margin-right: 0.5rem;" onclick="editUser('${userId}')">
                            <i class="material-icons">edit</i>
                        </button>
                        <button class="btn ${user.active ? 'btn-secondary' : 'btn-primary'}" style="padding: 0.5rem;" onclick="toggleUserStatus('${userId}', ${!user.active})">
                            <i class="material-icons">${user.active ? 'block' : 'check'}</i>
                        </button>
                    </td>
                `;
                
                usersTable.appendChild(row);
            });
            
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading users:', error);
            usersTable.innerHTML = `
                <tr>
                    <td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                        Eroare la încărcarea utilizatorilor. Vă rugăm să încercați din nou.
                    </td>
                </tr>
            `;
            hideLoading();
        });
}

// =============================================
// Analytics Functions
// =============================================

// Load analytics data based on selected time range
function loadAnalyticsData() {
    showLoading();
    
    // Get selected time range
    const timeRange = timeRangeFilter.value;
    
    // Create date labels based on time range
    const dateLabels = [];
    const today = new Date();
    
    if (timeRange === 'day') {
        // Last 24 hours by hour
        for (let i = 23; i >= 0; i--) {
            const date = new Date(today);
            date.setHours(today.getHours() - i);
            dateLabels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
    } else if (timeRange === 'week') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dateLabels.push(date.toLocaleDateString([], { weekday: 'short', day: 'numeric' }));
        }
    } else if (timeRange === 'month') {
        // Last 30 days by week
        for (let i = 4; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - (i * 7));
            dateLabels.push(`Săpt ${i + 1}`);
        }
    } else if (timeRange === 'quarter') {
        // Last 3 months by month
        for (let i = 2; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(today.getMonth() - i);
            dateLabels.push(date.toLocaleDateString([], { month: 'short' }));
        }
    } else if (timeRange === 'year') {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(today.getMonth() - i);
            dateLabels.push(date.toLocaleDateString([], { month: 'short' }));
        }
    }
    
    // In a real app, fetch this data from Firestore
    // For demo purposes, generate random data
    
    // Generate random data
    const generateRandomData = (count, min, max) => {
        return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    };
    
    // Chats by day data
    const totalChats = generateRandomData(dateLabels.length, 5, 30);
    const resolvedChats = totalChats.map(val => Math.floor(val * (0.7 + Math.random() * 0.3)));
    
    // Chats by department data
    const departments = ['Circulație', 'Ordine Publică', 'Mediu', 'Comerț', 'General'];
    const departmentChats = generateRandomData(departments.length, 10, 50);
    
    // Response time data
    const responseTime = generateRandomData(dateLabels.length, 1, 10);
    
    // Satisfaction data
    const satisfactionLabels = ['Foarte mulțumit', 'Mulțumit', 'Neutru', 'Nemulțumit', 'Foarte nemulțumit'];
    const satisfactionData = generateRandomData(satisfactionLabels.length, 5, 50);
    
    // Create/update charts
    createOrUpdateCharts(dateLabels, totalChats, resolvedChats, departments, departmentChats, responseTime, satisfactionLabels, satisfactionData);
    
    // Load agent stats
    loadAgentStats();
    
    hideLoading();
}

// Create or update charts
function createOrUpdateCharts(dateLabels, totalChats, resolvedChats, departments, departmentChats, responseTime, satisfactionLabels, satisfactionData) {
    // Configure Chart.js global settings
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.color = '#666666';
    
    // Chats by day chart
    const chatsByDayCtx = document.getElementById('chatsByDayChart').getContext('2d');
    
    if (chatsByDayChart) {
        chatsByDayChart.data.labels = dateLabels;
        chatsByDayChart.data.datasets[0].data = totalChats;
        chatsByDayChart.data.datasets[1].data = resolvedChats;
        chatsByDayChart.update();
    } else {
        chatsByDayChart = new Chart(chatsByDayCtx, {
            type: 'line',
            data: {
                labels: dateLabels,
                datasets: [
                    {
                        label: 'Total conversații',
                        data: totalChats,
                        backgroundColor: 'rgba(30, 136, 229, 0.2)',
                        borderColor: 'rgba(30, 136, 229, 1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Conversații rezolvate',
                        data: resolvedChats,
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }
    
    // Chats by department chart
    const chatsByDepartmentCtx = document.getElementById('chatsByDepartmentChart').getContext('2d');
    
    if (chatsByDepartmentChart) {
        chatsByDepartmentChart.data.labels = departments;
        chatsByDepartmentChart.data.datasets[0].data = departmentChats;
        chatsByDepartmentChart.update();
    } else {
        chatsByDepartmentChart = new Chart(chatsByDepartmentCtx, {
            type: 'bar',
            data: {
                labels: departments,
                datasets: [
                    {
                        label: 'Conversații',
                        data: departmentChats,
                        backgroundColor: [
                            'rgba(30, 136, 229, 0.7)',
                            'rgba(76, 175, 80, 0.7)',
                            'rgba(255, 193, 7, 0.7)',
                            'rgba(255, 87, 34, 0.7)',
                            'rgba(156, 39, 176, 0.7)'
                        ],
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Response time chart
    const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
    
    if (responseTimeChart) {
        responseTimeChart.data.labels = dateLabels;
        responseTimeChart.data.datasets[0].data = responseTime;
        responseTimeChart.update();
    } else {
        responseTimeChart = new Chart(responseTimeCtx, {
            type: 'line',
            data: {
                labels: dateLabels,
                datasets: [
                    {
                        label: 'Timp mediu răspuns (min)',
                        data: responseTime,
                        backgroundColor: 'rgba(255, 193, 7, 0.2)',
                        borderColor: 'rgba(255, 193, 7, 1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }
    
    // Satisfaction chart
    const satisfactionCtx = document.getElementById('satisfactionChart').getContext('2d');
    
    if (satisfactionChart) {
        satisfactionChart.data.labels = satisfactionLabels;
        satisfactionChart.data.datasets[0].data = satisfactionData;
        satisfactionChart.update();
    } else {
        satisfactionChart = new Chart(satisfactionCtx, {
            type: 'doughnut',
            data: {
                labels: satisfactionLabels,
                datasets: [
                    {
                        data: satisfactionData,
                        backgroundColor: [
                            'rgba(76, 175, 80, 0.7)',
                            'rgba(139, 195, 74, 0.7)',
                            'rgba(255, 193, 7, 0.7)',
                            'rgba(255, 152, 0, 0.7)',
                            'rgba(244, 67, 54, 0.7)'
                        ],
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
}

// Load agent statistics for analytics
function loadAgentStats() {
    // In a real app, this would load data from Firestore
    // For demo purposes, we'll generate random data
    
    // Clear table
    agentStatsTable.innerHTML = '';
    
    // Get agent data
    db.collection('users')
        .where('role', 'in', ['agent', 'supervisor'])
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                agentStatsTable.innerHTML = `
                    <tr>
                        <td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                            Nu există agenți.
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Generate random stats for each agent
            snapshot.forEach(doc => {
                const agent = doc.data();
                
                // Generate random stats
                const totalChats = Math.floor(Math.random() * 100) + 10;
                const resolvedChats = Math.floor(totalChats * (0.7 + Math.random() * 0.3));
                const avgResponseTime = Math.floor(Math.random() * 10) + 1;
                const satisfaction = Math.floor(Math.random() * 50) + 50; // 50-100%
                
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td style="padding: 1rem; text-align: left; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${agent.displayName || agent.email}
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${totalChats}
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${resolvedChats} (${Math.round(resolvedChats / totalChats * 100)}%)
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        ${avgResponseTime}m
                    </td>
                    <td style="padding: 1rem; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1);">
                        <div style="width: 100%; background-color: #f1f1f1; height: 8px; border-radius: 4px;">
                            <div style="width: ${satisfaction}%; height: 100%; background-color: ${satisfaction > 80 ? 'var(--success-color)' : satisfaction > 60 ? 'var(--warning-color)' : 'var(--danger-color)'}; border-radius: 4px;"></div>
                        </div>
                        <span style="font-size: 0.8rem;">${satisfaction}%</span>
                    </td>
                `;
                
                agentStatsTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading agent stats:', error);
            agentStatsTable.innerHTML = `
                <tr>
                    <td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                        Eroare la încărcarea statisticilor agenților. Vă rugăm să încercați din nou.
                    </td>
                </tr>
            `;
        });
}

// Export analytics to CSV
function exportAnalytics() {
    // In a real app, this would export the current analytics data
    // For demo purposes, we'll just show an alert
    alert('Export inițiat. Raportul va fi descărcat în curând.');
    
    // Simple CSV export example
    const csvContent = [
        'Dată,Total conversații,Conversații rezolvate,Timp mediu răspuns,Satisfacție',
        '2023-05-01,45,38,3.2,87%',
        '2023-05-02,52,43,2.8,91%',
        '2023-05-03,38,31,4.1,84%',
        '2023-05-04,61,55,2.5,92%',
        '2023-05-05,47,40,3.5,88%'
    ].join('\n');
    
    // Create downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'analytics_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Print analytics report
function printAnalytics() {
    // In a real app, this would generate a print-friendly view
    // For demo purposes, we'll just call window.print()
    window.print();
}

// =============================================
// Session Management Functions
// =============================================

// Set up session timeout
function setupSessionTimeout() {
    // Clear existing timeout
    if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
    }
    
    // Get timeout duration from settings (in minutes), default to 30 minutes
    const timeoutMinutes = currentUserData && 
                        currentUserData.settings && 
                        currentUserData.settings.sessionTimeout ? 
                        parseInt(currentUserData.settings.sessionTimeout) : 30;
    
    // Convert to milliseconds
    const timeoutMs = timeoutMinutes * 60 * 1000;
    
    // Set new timeout
    sessionTimeoutId = setTimeout(() => {
        // Timeout reached, log user out
        console.log('Session timeout reached. Logging out...');
        auth.signOut()
            .then(() => {
                // Clear session data
                currentUser = null;
                currentUserData = null;
                
                // Show login screen
                showLoginScreen();
                
                // Show message
                alert('Ați fost deconectat automat din cauza inactivității. Vă rugăm să vă conectați din nou.');
            })
            .catch(error => {
                console.error('Error signing out:', error);
            });
    }, timeoutMs);
}

// Reset session timeout on user activity
function resetSessionTimeout() {
    if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
        setupSessionTimeout();
    }
}

// =============================================
// Settings Functions
// =============================================

// Load settings data
function loadSettingsData() {
    // Show loading
    showLoading();
    
    // Get user settings
    if (currentUser && currentUserData) {
        const settings = currentUserData.settings || {};
        
        // Set form values
        settingBrowserNotifications.checked = settings.browserNotifications !== false;
        settingSoundNotifications.checked = settings.soundNotifications !== false;
        settingEmailNotifications.checked = settings.emailNotifications === true;
        settingTwoFactorAuth.checked = currentUserData.twoFactorEnabled === true;
        settingSessionTimeout.value = settings.sessionTimeout || '30';
        settingAutoAssign.checked = settings.autoAssign === true;
        settingMaxChats.value = settings.maxChats || '3';
    }
    
    // Hide loading
    hideLoading();
}

// Save settings
function saveSettings() {
    // Show loading
    showLoading();
    
    // Get form values
    const settings = {
        browserNotifications: settingBrowserNotifications.checked,
        soundNotifications: settingSoundNotifications.checked,
        emailNotifications: settingEmailNotifications.checked,
        sessionTimeout: settingSessionTimeout.value,
        autoAssign: settingAutoAssign.checked,
        maxChats: settingMaxChats.value
    };
    
    // Update user settings
    db.collection('users').doc(currentUser.uid).update({
        settings: settings,
        twoFactorEnabled: settingTwoFactorAuth.checked,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        // Update local user data
        currentUserData.settings = settings;
        currentUserData.twoFactorEnabled = settingTwoFactorAuth.checked;
        
        // Show success message
        alert('Setările au fost salvate cu succes.');
        
        // Reset session timeout with new value
        setupSessionTimeout();
        
        // Hide loading
        hideLoading();
    })
    .catch(error => {
        console.error('Error saving settings:', error);
        alert('Eroare la salvarea setărilor. Vă rugăm să încercați din nou.');
        hideLoading();
    });
}

// Ensure all functions are available globally
window.showNewTemplateModal = showNewTemplateModal;
window.hideTemplateModal = hideTemplateModal;
window.saveTemplate = saveTemplate;
window.filterTemplates = filterTemplates;
window.editTemplate = editTemplate;
window.deleteTemplate = deleteTemplate;
window.loadTemplatesData = loadTemplatesData;

window.showNewUserModal = showNewUserModal;
window.hideUserModal = hideUserModal;
window.saveUser = saveUser;
window.filterUsers = filterUsers;
window.editUser = editUser;
window.toggleUserStatus = toggleUserStatus;
window.loadUsersData = loadUsersData;

window.loadAgentStats = loadAgentStats;
window.exportAnalytics = exportAnalytics;
window.printAnalytics = printAnalytics;
window.loadAnalyticsData = loadAnalyticsData;
window.createOrUpdateCharts = createOrUpdateCharts;

window.loadSettingsData = loadSettingsData;
window.saveSettings = saveSettings;
window.setupSessionTimeout = setupSessionTimeout;
window.resetSessionTimeout = resetSessionTimeout;

// For debugging
console.log('Admin functions loaded successfully!');
