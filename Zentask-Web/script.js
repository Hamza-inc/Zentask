// Güncellenmiş script.js
let tasks = [];

const pageTitleInput = document.getElementById('page-title');
const newPageBtn = document.getElementById('new-page-btn');
const saveJsonBtn = document.getElementById('save-json-btn');
const loadJsonBtn = document.getElementById('load-json-btn');
const loadJsonInput = document.getElementById('load-json-input');

const todoListDiv = document.getElementById('todo-list');
const underconListDiv = document.getElementById('undercon-list');
const doneListDiv = document.getElementById('done-list');
const addTaskBtn = document.getElementById('add-task-btn');

function renderTasks() {
    todoListDiv.innerHTML = '';
    doneListDiv.innerHTML = '';
	underconListDiv.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
	
	tasks.sort((a, b) => {
        const dateA = new Date(a.due || '9999-12-31'); // eksik tarihleri sona at
        const dateB = new Date(b.due || '9999-12-31');
        return dateA - dateB;
    });

    tasks.forEach((task, index) => {
        const card = document.createElement('div');
        card.className = 'task-card';

        const titleElem = document.createElement('div');
        titleElem.className = 'task-title';
        titleElem.innerText = task.title;
        card.appendChild(titleElem);

        if (task.desc) {
            const descElem = document.createElement('div');
            descElem.className = 'task-desc';
            descElem.innerHTML = DOMPurify.sanitize(task.desc);
            card.appendChild(descElem);
        }

        if (task.due) {
            const dateElem = document.createElement('div');
            dateElem.className = 'task-date';
            const dateObj = new Date(task.due);
            dateElem.innerText = 'Last Date: ' + dateObj.toLocaleDateString('tr-TR');
            card.appendChild(dateElem);

            const dueDate = new Date(task.due);
            dueDate.setHours(0, 0, 0, 0);
            if (!task.completed && dueDate <= today) {
                card.classList.add('overdue');
            }
        }

        if (task.inProgress && !task.completed) {
            card.classList.add('in-progress');
        }
		
		if (task.completed)
		{
			card.classList.add('done');
		}

        if (!task.completed) {
            const inProgressBtn = document.createElement('button');
            inProgressBtn.className = 'in-progress-btn task-button';
            inProgressBtn.innerText = 'In Progress';
            inProgressBtn.addEventListener('click', () => {
                task.inProgress = !task.inProgress;
                renderTasks();
            });
            card.appendChild(inProgressBtn);
        }
		
		const editBtn = document.createElement('button');
            editBtn.className = 'edit-task-btn task-button';
            editBtn.innerText = 'Edit';
            editBtn.addEventListener('click', () => {
                const newTitle = prompt('Yeni başlık:', task.title);
                const newDesc = prompt('Yeni açıklama:', task.desc);
                const newDue = prompt('Yeni tarih (YYYY-MM-DD):', task.due);
                if (newTitle) task.title = newTitle;
                if (newDesc !== null) task.desc = newDesc;
                if (newDue) task.due = newDue;
                renderTasks();
                updatePriorityList();
            });
            card.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-task task-button';
        deleteBtn.innerText = '×';
        deleteBtn.title = 'Sil';
        deleteBtn.addEventListener('click', () => {
            const confirmDelete = confirm('Bu görevi silmek istediğinize emin misiniz?');
            if (confirmDelete) {
                tasks.splice(index, 1);
                renderTasks();
                updatePriorityList();
            }
        });
        card.appendChild(deleteBtn);
		
		const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
			task.inProgress = false;
            task.completed = checkbox.checked;
            renderTasks();
            updatePriorityList();
        });
        card.appendChild(checkbox);

        if (task.completed) {
            doneListDiv.appendChild(card);
        } else if (task.inProgress){
            underconListDiv.appendChild(card);
        }else {
            todoListDiv.appendChild(card);
        }
    });
}

function updatePriorityList() {
    const priorityList = document.getElementById('priority-list');
    const priorityContainer = document.getElementById('priority-container');
    priorityList.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let hasPriority = false;

    tasks.forEach(task => {
        if (!task.completed && task.due) {
            const dueDate = new Date(task.due);
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate <= today) {
                const li = document.createElement('li');
                li.innerText = task.title + ' (' + new Date(task.due).toLocaleDateString('tr-TR') + ')';
                priorityList.appendChild(li);
                hasPriority = true;
            }
        }
    });

    priorityContainer.style.display = hasPriority ? 'block' : 'none';
}

newPageBtn.addEventListener('click', () => {
    const name = prompt('Yeni sayfa adı:');
    if (name) {
        pageTitleInput.value = name;
        tasks = [];
        renderTasks();
        updatePriorityList();
    }
});

addTaskBtn.addEventListener('click', () => {
    const title = document.getElementById('task-title').value;
    const desc = document.getElementById('task-desc').value;
    let  due = document.getElementById('task-date').value;
    if (title) {
		
		if (!due) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            due = tomorrow.toISOString().split('T')[0];
        }
		
        tasks.push({ title, desc, due, completed: false, inProgress: false });
        renderTasks();
        updatePriorityList();
        document.getElementById('task-title').value = '';
        document.getElementById('task-desc').value = '';
        document.getElementById('task-date').value = '';
    }
});

function downloadObjectAsJson(exportObj, exportName) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

saveJsonBtn.addEventListener('click', () => {
    const data = {
        name: pageTitleInput.value || 'Sayfa',
        tasks: tasks
    };
    downloadObjectAsJson(data, pageTitleInput.value || 'Sayfa');
});

loadJsonBtn.addEventListener('click', () => {
    loadJsonInput.click();
});
loadJsonInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const obj = JSON.parse(e.target.result);
            pageTitleInput.value = obj.name || '';
            tasks = obj.tasks || [];
            renderTasks();
            updatePriorityList();
        } catch (err) {
            alert('Geçersiz JSON dosyası');
        }
    };
    reader.readAsText(file);
});
