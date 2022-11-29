import { usertask, database } from './app';

export default function init() {
    const header = document.createElement('header');
    const container = document.createElement('div');
    const footer = document.createElement('footer');
    const editinfo = document.createElement('div');

    container.addEventListener('wheel', horizontolScroll);
    editinfo.addEventListener('mousedown', (event) => {
        if (event.target.id === 'editinfo') {
            editinfo.style.display = 'none';
        }
    });

    header.innerHTML = '<h1>to-do</h1>';
    footer.innerHTML = '<p>Copyright &#169; <a href="https://trgao.github.io">Tian Run</a> 2022 <a href="https://github.com/trgao"><img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" style="height: 15px; width: auto;"></a></p>';
    editinfo.innerHTML = '<div id="form"></div>'

    container.id = 'container';
    editinfo.id = 'editinfo';
    loadLists(container);
    document.body.append(header, container, editinfo, footer);
}

//create new list div
function createList(name) {
    const newlist = document.createElement('div');
    newlist.classList.add('griditem');
    newlist.classList.add('list');

    newlist.innerHTML = `
        <div class='clear'>&nbsp;</div>
        <div class="name"><button class="removelist">X</button><div class='clear'>&nbsp;</div><span contenteditable="true">${name}</span><div class='clear'>&nbsp;</div></div>
        <div class='clear'>&nbsp;</div>
        <div style="display: flex; flex-direction: column;">
            <div class="listview"></div>
            <button class="add">+</button>
        </div>
    `;

    const span = newlist.querySelector('span');
    exitFocusKey(focusAll(newlist.querySelector('span')));
    span.addEventListener('focusout', () => {
        database.updateListName(span.textContent, listIndex(newlist));
    });

    newlist.addEventListener('mouseenter', (event) => {
        event.target.querySelector('.listview').style = 'overflow-y: auto';
        container.removeEventListener('wheel', horizontolScroll);
    });
    newlist.addEventListener('mouseleave', (event) => {
        event.target.querySelector('.listview').style = 'overflow-y: hidden';
        container.addEventListener('wheel', horizontolScroll);
    });

    newlist.querySelector('.name').addEventListener('mouseenter', (event) => {
        event.target.querySelector('.removelist').style.display = 'inline-block';
    });
    newlist.querySelector('.name').addEventListener('mouseleave', (event) => {
        event.target.querySelector('.removelist').style.display = 'none';
    });

    newlist.querySelector('.add').addEventListener('click', () => {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd;

        createTask('', newlist);
        database.addTask(new usertask('', '', today, '0', false), listIndex(newlist));
    });
    newlist.querySelector('.removelist').addEventListener('click', () => {
        database.removeList(listIndex(newlist));
        document.getElementById('container').removeChild(newlist);
    })

    return newlist;
}

//adds new list div to container
function newList() {
    const container = document.getElementById('container');
    const button = document.getElementById('new');
    const newlist = createList('tasks');
    const span = newlist.querySelector('span');

    container.removeChild(button);
    container.append(newlist, button);
    database.storeList(span.textContent);
    span.focus();
}

//create lists from localStorage and add to container
function loadLists(container) {
    const button = document.createElement('button');

    button.textContent = '+ new list';
    button.id = 'new';
    button.classList.add('griditem');
    button.addEventListener('click', newList);
    
    var counter = 0;
    database.accessLists().forEach(lst => {
        const newlist = createList(lst);
        container.appendChild(newlist);
        database.accessTasks()[counter].forEach(task => {
            const newtask = createTask(task.name, newlist);
            newtask.classList.add('impt' + task.impt);
            const span = newtask.querySelector('span');
            if (task.tick) {
                span.style.textDecoration = 'line-through';
            } else {
                span.style.textDecoration = 'none';
            }
            newtask.querySelector('input').checked = task.tick;
        });
        counter += 1;
    });
    container.appendChild(button);
}

//create task div
function createTask(name, lst) {
    const listview = lst.querySelector('.listview');
    const newtask = document.createElement('div');
    newtask.classList.add('task');
    newtask.classList.add('impt0');
    newtask.innerHTML = `
        <div class='clear'>&nbsp;</div>
        <div class="taskblock"><input type='checkbox' class='check'><div class='clear'>&nbsp;</div><span contenteditable="true" spellcheck = "false"></span><div class='clear'>&nbsp;</div><button class="edit">i</button><button class="removetask">X</button></div>
        <div class='clear'>&nbsp;</div>
    `

    listview.appendChild(newtask);

    newtask.querySelector('.check').addEventListener('click', (event) => {
        event.target.focus();
        const task = event.target.parentNode.querySelector('span');
        if (event.target.checked) {
            task.style.textDecoration = 'line-through';
        } else {
            task.style.textDecoration = 'none';
        }
        database.updateTaskTick(event.target.checked, listIndex(lst), taskIndex(listview, newtask));
    });

    const span = newtask.querySelector('span');
    span.textContent = name;
    newtask.addEventListener('mouseenter', showButtons);
    newtask.addEventListener('mouseleave', hideButtons);
    span.addEventListener('focusin', (event) => {
        showButtons(event);
        newtask.removeEventListener('mouseleave', hideButtons);
    });
    span.addEventListener('focusout', (event) => {
        hideButtons(event);
        newtask.addEventListener('mouseleave', hideButtons);
        database.updateTaskName(span.textContent, listIndex(lst), taskIndex(listview, newtask));
    });

    newtask.querySelector('.edit').addEventListener('mousedown', (event) => {
        span.blur();
        editInfo(listIndex(lst), taskIndex(listview, newtask));
    });
    newtask.querySelector('.removetask').addEventListener('click', () => {
        database.removeTask(listIndex(lst), taskIndex(listview, newtask));
        listview.removeChild(newtask);
    });

    exitFocusKey(span);
    span.focus();

    return newtask;
}

//edit task info
function editInfo(i, j) {
    const editinfo = document.getElementById('editinfo');
    editinfo.style.display = 'flex';
    const form = document.getElementById('form');
    const task = database.getTask(i, j);
    const newtask = document.querySelectorAll('.list')[i].querySelectorAll('.task')[j];
    form.innerHTML = `
        <h1>${task.name}</h1>
        <div class="formel">
            <label for="date">due date</label>
            <input type="date" name="date" value="${task.date}" id="date">
        </div>
        <div class="formel">
            <label for="impt">priority</label>
            <input type="number" name="impt" min="0" max="3" value="${task.impt}" id="impt">
        </div>
        <div class="formel">
            <label for="info">description</label>
            <textarea name="info" id="info">${task.info}</textarea>
        </div>
        <input type="submit" value="confirm" id="submit">
    `;

    document.getElementById('impt').oninput = (event) => {
        if (event.target.value.length > 1) {
            event.target.value = event.data > 3 ? 3 : event.data;
        } else if (event.target.value > 3) {
            event.target.value = 3;
        }
    };

    document.getElementById('submit').addEventListener('click', () => {
        const info = document.getElementById('info').value;
        const date = document.getElementById('date').value;
        const impt = document.getElementById('impt').value;
        database.updateTaskProp(info, date, impt, i, j);
        newtask.className = "task";
        newtask.classList.add('impt' + impt);
        editinfo.style.display = 'none';
    });
}

//utility functions
function horizontolScroll(event) {
    event.preventDefault();
    container.scrollLeft += event.deltaY;
}

function focusAll(el) {
    el.onfocus = function() {
        window.setTimeout(function() {
            var sel, range;
            if (window.getSelection && document.createRange) {
                range = document.createRange();
                range.selectNodeContents(el);
                sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (document.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(el);
                range.select();
            }
        }, 1);
    };

    return el;
}

function exitFocusKey(el) {
    el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
            document.getSelection().removeAllRanges();
        }
    });
}

function listIndex(lst) {
    const parents = Array.from(document.getElementById('container').childNodes);
    return parents.indexOf(lst);
}

function taskIndex(listview, task) {
    const tasks = Array.from(listview.childNodes);
    return tasks.indexOf(task);
}

function showButtons(event) {
    const task = event.target.classList.value.includes('task') ? event.target : event.target.parentNode;
    task.querySelectorAll('button').forEach(button => {
            button.style.visibility = 'visible'
    });
}

function hideButtons(event) {
    const task = event.target.classList.value.includes('task') ? event.target : event.target.parentNode;
    task.querySelectorAll('button').forEach(button => {
            button.style.visibility = 'hidden'
    });
}