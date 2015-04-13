# TodoMVC Using Angular 1 Components

In this post we will build a basic version of the [TodoMVC](http://todomvc.com)
app using "components".

![](./todo-app.png)

As you may know, [Angular 2 has no controllers](http://blog.mgechev.com/2015/04/06/angular2-first-impressions/#angular2-has-no-controllers), and instead introduces the concept of components.

A **component** is the building block of our user interface. They can manage
an internal state as well as user interactions. In Angular 1, we can write our
components using directives.

Let's examine our HTML first.

```html
<body>
  <todo-app></todo-app>
  <script src="js/index.js"></script>
</body>
```

The `<todo-app>` element is where we initialize our first component: `todoApp`.

```js
// ./components/todoApp.js
export default () => ({
  template: `
    <div>
      <section class="todoapp">
        <header class="header">
          <h1>todos</h1>
          <create-todo-form on-create="ctrl.handleCreate(todo)"></create-todo-form>
        </header>
        <div ng-if="ctrl.state.todos.length">
          <section class="main">
            <todo-list
                  todos="ctrl.state.todos"
                  on-update="ctrl.handleUpdate(todo)"
                  on-destroy="ctrl.handleDestroy(todo)">
            </todo-list>
          </section>
          <footer class="footer">
            <remaining-todo-count todos="ctrl.state.todos"></remaining-todo-count>
          </footer>
        </div>
      </section>
    </div>
  `,
  controller: class {
    constructor(todoService) {
      this.todoService = todoService;
      this.state = {};
      this.updateTodos();
    }

    updateTodos() {
      this.state.todos = this.todoService.all();
    }

    handleCreate(todo) {
      this.todoService.create(todo);
      this.updateTodos();
    }

    handleUpdate(todo) {
      this.todoService.update(todo);
      this.updateTodos();
    }

    handleDestroy(todo) {
      this.todoService.destroy(todo);
      this.updateTodos();
    }
  },
  restrict: 'E',   bindToController: true, controllerAs: 'ctrl'
});
```

The `todo-app` uses three smaller **components**:

1. `create-todo-form` - Create form for a new todo.
2. `todo-list` - List of todos with checkboxes to mark completion. Also allows todos to be edited and deleted.
3. `remaining-todo-count` - Given todos, displays the count of non-completed todos.

We also have a **service**, `todoService`, that performs CRUD operations on todos.
Since services are not the focal point of this post, I will not show the code for
the service. The git repository for a full, working example is at the end of the post.

Now, let's look at each component in order.

## create-todo-form

- Renders a `<form>` with an `<input>` that captures the title of the todo item.
- When user submits (e.g. hits Enter), the `on-create` callback is invoked with the new todo item, and the input clears.

```js
// ./components/createTodoForm.js
export default () => ({
  scope: { createCallback: '&onCreate' },
  template: `
    <form ng-submit="ctrl.handleCreate(ctrl.todoForm)">
      <input autofocus class="new-todo"
             type="text"
             ng-model="ctrl.todoForm.title"
             placeholder="What needs to be done?" />
    </form>
  `,
  controller: class {
    constructor() { this.reset() }
    reset() { this.todoForm = {}  }
    handleCreate(todo) {
      this.createCallback({todo: todo});
      this.reset();
    }
  },
  restrict: 'E', bindToController: true, controllerAs: 'ctrl'
});
```

## todo-list

```js
// ./components/todoList.js
export default () => ({
  scope: {
    todos: '=',
    updateCallback: '&onUpdate',
    destroyCallback: '&onDestroy'
  },
  template: `
    <ul class="todo-list">
      <li ng-repeat="todo in ctrl.todos track by todo.id">
        <todo-item todo="todo"
                   on-update="ctrl.handleUpdate(todo)"
                   on-save="ctrl.handleUpdate(todo)"
                   on-destroy="ctrl.handleDestroy(todo)" />
      </li>
    </ul>
  `,
  controller: class {
    handleUpdate(todo) {
      this.updateCallback({todo: todo});
    }

    handleDestroy(todo) {
      this.destroyCallback({todo: todo});
    }
  },
  restrict: 'E', bindToController: true, controllerAs: 'ctrl'
});
```
## todo-list-item

```js
import _ from 'lodash';

export default () => ({
  scope: {
    todo: '=',
    updateCallback: '&onUpdate',
    destroyCallback: '&onDestroy'
  },
  template: `
    <div ng-class="{'editing': ctrl.todoForm, 'completed': ctrl.todo.completed}">
      <div class="view">
        <input class="toggle"
               type="checkbox"
               ng-model="ctrl.todo.completed"
               ng-change="ctrl.handleCompleteToggle()" />
        <label ng-dblclick="ctrl.edit()">
          {{ctrl.todo.title}}
        </label>
        <button class="destroy"
                ng-click="ctrl.handleDestroy()"></button>
      </div>
      <form ng-submit="ctrl.handleSaveEdit()">
        <input class="edit"
               ng-model="ctrl.todoForm.title"
               ng-blur="ctrl.reset()"
               ng-keyup="ctrl.handleKeyUp($event)" />
      </form>
    </div>
  `,
  controller: class {
    constructor($element) {
      this.editInput = $element.find('input')[1];
    }

    edit() {
      this.todoForm = _.extend({}, this.todo);
      setTimeout(() => this.editInput.focus(), 0);
    }

    reset() {
      this.todoForm = null;
    }

    handleCompleteToggle() {
      this.updateCallback({todo: this.todo});
    }

    handleSaveEdit() {
      this.updateCallback({todo: this.todoForm});
      this.reset();
    }

    handleDestroy() {
      this.destroyCallback({todo: this.todo});
    }

    handleKeyUp(evt) {
      if (evt.keyCode === 27) this.reset();
    }
  },
  restrict: 'E', bindToController: true, controllerAs: 'ctrl'
});
```
