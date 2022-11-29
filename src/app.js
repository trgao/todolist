export class usertask {
    constructor(name, info, date, impt, tick) {
        this.name = name;
        this.info = info;
        this.date = date;
        this.impt = impt;
        this.tick = tick;
    }
}

export const database = function() {
    var lists = [];
    var tasks = [];

    if (storageAvailable('localStorage')) {
        lists = getLists() === null ? [] : getLists();
        tasks = getTasks() === null ? [] : getTasks();
    }

    function getLists() {
        return JSON.parse(localStorage.getItem('lists'));
    }

    function getTasks() {
        return JSON.parse(localStorage.getItem('tasks'));
    }

    function updateLists() {
        if (storageAvailable('localStorage')) {
            localStorage.setItem('lists', JSON.stringify(lists));
        }
    }

    function updateTasks() {
        if (storageAvailable('localStorage')) {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }

    function removeList(i) {
        lists.splice(i, 1);
        tasks.splice(i, 1);
        updateLists();
        updateTasks();
    }

    function removeTask(i, j) {
        tasks[i].splice(j, 1);
        updateTasks();
    }

    function storeList(name) {
        lists.push(name);
        tasks.push([]);
        updateLists();
        updateTasks();
    }

    function updateListName(name, i) {
        lists[i] = name;
        updateLists();
    }

    function addTask(task, i) {
        tasks[i].push(task);
        updateTasks();
    }

    function updateTaskName(name, i, j) {
        tasks[i][j].name = name;
        updateTasks();
    }

    function updateTaskTick(tick, i, j) {
        tasks[i][j].tick = tick;
        updateTasks();
    }

    function updateTaskProp(info, date, impt, i, j) {
        tasks[i][j].info = info;
        tasks[i][j].date = date;
        tasks[i][j].impt = impt;
        updateTasks();
    }

    function accessLists() {
        return lists;
    }

    function accessTasks() {
        return tasks;
    }

    function getTask(i, j) {
        return tasks[i][j];
    }

    return {
        removeList, 
        removeTask, 
        storeList, 
        updateListName, 
        addTask, 
        updateTaskName, 
        updateTaskTick, 
        updateTaskProp, 
        accessLists, 
        accessTasks, 
        getTask
    }
}();

// check localStorage
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return false;
    }
}