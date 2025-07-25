document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const dateInput = document.getElementById('date-input');
    const addBtn = document.getElementById('add-btn');
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    const sortSelect = document.getElementById('sort-select');
    const todoList = document.getElementById('todo-list');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const totalTasksElement = document.getElementById('total-tasks');
    const completedTasksElement = document.getElementById('completed-tasks');
    const pendingTasksElement = document.getElementById('pending-tasks');
    const validationPopup = document.getElementById('validation-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');
    const popupConfirm = document.getElementById('popup-confirm');
    const closePopup = document.querySelector('.close-popup');

    // Initialize todos from localStorage or empty array
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    // Initialize the app
    renderTodos();
    updateStats();

    // Event Listeners
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
    });
    searchInput.addEventListener('input', renderTodos);
    filterSelect.addEventListener('change', renderTodos);
    sortSelect.addEventListener('change', renderTodos);
    deleteAllBtn.addEventListener('click', confirmDeleteAll);
    popupConfirm.addEventListener('click', hidePopup);
    closePopup.addEventListener('click', hidePopup);
    validationPopup.addEventListener('click', function(e) {
        if (e.target === validationPopup) {
            hidePopup();
        }
    });

    // Add new todo
    function addTodo() {
        const todoText = todoInput.value.trim();
        const todoDate = dateInput.value;

        if (!todoText && !todoDate) {
            showPopup('Missing Information', 'Please enter both a task and due date');
            return;
        }

        if (!todoText) {
            showPopup('Missing Task', 'Please enter a task description');
            return;
        }

        if (!todoDate) {
            showPopup('Missing Date', 'Please select a due date');
            return;
        }

        const newTodo = {
            id: Date.now(),
            text: todoText,
            date: formatDateForStorage(todoDate),
            completed: false,
            createdAt: new Date().toISOString()
        };

        todos.push(newTodo);
        saveTodos();
        renderTodos();
        updateStats();

        // Clear inputs
        todoInput.value = '';
        dateInput.value = '';
        dateInput.type = 'text';
        dateInput.placeholder = 'Due date';
    }

    // Render todos based on filters and search
    function renderTodos() {
        const searchTerm = searchInput.value.toLowerCase();
        const filter = filterSelect.value;
        const sort = sortSelect.value;
        const today = new Date().toISOString().split('T')[0];

        // Filter todos
        let filteredTodos = todos.filter(todo => {
            const matchesSearch = todo.text.toLowerCase().includes(searchTerm);
            let matchesFilter = true;

            if (filter === 'completed') matchesFilter = todo.completed;
            if (filter === 'pending') matchesFilter = !todo.completed;

            return matchesSearch && matchesFilter;
        });

        // Sort todos
        filteredTodos.sort((a, b) => {
            if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sort === 'due-date') return new Date(a.date) - new Date(b.date);
            return 0;
        });

        // Clear the list
        todoList.innerHTML = '';

        // Show empty state if no todos
        if (filteredTodos.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No tasks found';
            todoList.appendChild(emptyState);
            return;
        }

        // Render each todo
        filteredTodos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = 'todo-item';

            // Determine status
            const isOverdue = !todo.completed && new Date(todo.date) < new Date(today);
            const status = todo.completed ? 'completed' : isOverdue ? 'overdue' : 'pending';

            todoItem.innerHTML = `
                <div class="todo-task">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                    <div class="todo-text">${todo.text}</div>
                </div>
                <div class="todo-date">${formatDateForDisplay(todo.date)}</div>
                <div class="todo-status status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</div>
                <div class="todo-actions">
                    <button class="action-btn delete-btn" data-id="${todo.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;

            todoList.appendChild(todoItem);
        });

        // Add event listeners to checkboxes and delete buttons
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTodoStatus);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteTodo);
        });
    }

    // Toggle todo completion status
    function toggleTodoStatus(e) {
        const id = parseInt(e.target.dataset.id);
        const todo = todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            saveTodos();
            renderTodos();
            updateStats();
        }
    }

    // Delete a single todo
    function deleteTodo(e) {
        const id = parseInt(e.currentTarget.dataset.id);
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
    }

    // Confirm delete all todos
    function confirmDeleteAll() {
        if (todos.length === 0) {
            showPopup('No Tasks', 'There are no tasks to delete');
            return;
        }

        showPopup('Confirm Delete', 'Are you sure you want to delete all tasks?');
        
        // Temporarily change confirm button action
        const confirmHandler = function() {
            todos = [];
            saveTodos();
            renderTodos();
            updateStats();
            hidePopup();
            popupConfirm.removeEventListener('click', confirmHandler);
            popupConfirm.addEventListener('click', hidePopup);
        };
        
        popupConfirm.removeEventListener('click', hidePopup);
        popupConfirm.addEventListener('click', confirmHandler);
    }

    // Update statistics
    function updateStats() {
        totalTasksElement.textContent = todos.length;
        completedTasksElement.textContent = todos.filter(todo => todo.completed).length;
        pendingTasksElement.textContent = todos.filter(todo => !todo.completed).length;
    }

    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Show popup
    function showPopup(title, message) {
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        validationPopup.style.display = 'flex';
    }

    // Hide popup
    function hidePopup() {
        validationPopup.style.display = 'none';
    }

    // Format date for display (dd/mm/yyyy)
    function formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Format date for storage (yyyy-mm-dd)
    function formatDateForStorage(dateString) {
        if (dateString.includes('/')) {
            const [day, month, year] = dateString.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return dateString;
    }
});