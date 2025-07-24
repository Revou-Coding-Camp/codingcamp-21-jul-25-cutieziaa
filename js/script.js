document.addEventListener('DOMContentLoaded', function() {
    const todoInput = document.getElementById('todo-input');
    const dateInput = document.getElementById('date-input');
    const addBtn = document.getElementById('add-btn');
    const filterSelect = document.getElementById('filter-select');
    const todoList = document.getElementById('todo-list');
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    // Initialize the app
    renderTodos();
    
    // Add task event listener
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // Filter event listener
    filterSelect.addEventListener('change', renderTodos);
    
    function addTodo() {
        const todoText = todoInput.value.trim();
        const todoDate = dateInput.value;
        
        if (!todoText) {
            alert('Please enter a task!');
            return;
        }
        
        if (!todoDate) {
            alert('Please select a date!');
            return;
        }
        
        const newTodo = {
            id: Date.now(),
            text: todoText,
            date: todoDate,
            completed: false
        };
        
        todos.push(newTodo);
        saveTodos();
        renderTodos();
        
        // Clear inputs
        todoInput.value = '';
        dateInput.value = '';
    }
    
    function renderTodos() {
        const filter = filterSelect.value;
        const today = new Date().toISOString().split('T')[0];
        
        let filteredTodos = todos;
        
        if (filter === 'today') {
            filteredTodos = todos.filter(todo => todo.date === today);
        } else if (filter === 'upcoming') {
            filteredTodos = todos.filter(todo => todo.date > today);
        } else if (filter === 'past') {
            filteredTodos = todos.filter(todo => todo.date < today && !todo.completed);
        }
        
        todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'No tasks found';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#666';
            todoList.appendChild(emptyMessage);
            return;
        }
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            
            if (todo.date < today && !todo.completed) {
                li.classList.add('past-due');
            } else if (todo.date === today) {
                li.classList.add('today');
            }
            
            const todoContent = document.createElement('div');
            todoContent.className = 'todo-content';
            
            const todoText = document.createElement('span');
            todoText.className = 'todo-text';
            todoText.textContent = todo.text;
            
            const todoDate = document.createElement('span');
            todoDate.className = 'todo-date';
            todoDate.textContent = formatDate(todo.date);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
            
            todoContent.appendChild(todoText);
            todoContent.appendChild(todoDate);
            
            li.appendChild(todoContent);
            li.appendChild(deleteBtn);
            
            todoList.appendChild(li);
        });
    }
    
    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }
    
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});