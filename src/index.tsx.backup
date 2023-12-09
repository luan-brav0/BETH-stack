import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import * as elements from "typed-html";

// const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

const app = new Elysia()
  .use(html())

  .get("/", ({ html }) =>
    html(
      <BaseHTML>
        <body class="flex flex-col w-full h-screen justify-center items-center align-middle">
          <h1 class="bold text-3xl my-2">
            HTM<b class="ml-[-0.5rem] text-[#3d72d7]">X</b> from 🦊 Elysia, with
            TailwindCSS
          </h1>
          <button
            hx-post="/clicked"
            hx-swap="innerHTML"
            class="bg-gray-200 rounded-md shadow p-3"
          >
            Click me
          </button>
          <di
            class="bg-gray-200"
            hx-get="/todos"
            hx-trigger="load"
            hx-swap="outerHTML"
          />
        </body>
      </BaseHTML>,
    ),
  )

  .post("/clicked", () => <div>Greetings from the server</div>)

  .get("/todos", () => <TodoList todos={db} />)

  .post(
    "/todos/toggle/:id",
    ({ params }) => {
      const todo = db.find((todo) => todo.id === params.id);
      if (todo) {
        todo.completed = !todo.completed;
        return <TodoItem {...todo} />;
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
  )

  .delete(
    "/todos/:id",
    ({ params }) => {
      const todo = db.find((todo) => todo.id === params.id);
      if (todo) {
        db.splice(db.indexOf(todo), 1);
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
  )

  .post(
    "/todos",
    ({ body }) => {
      if (body.content.length == 0) {
        throw new Error("Content cannot be empty");
      }
      const newTodo = {
        id: getLastID() + 1,
        content: body.content,
        completed: false,
      };
      db.push(newTodo);
      return <TodoItem {...newTodo} />;
    },
    {
      body: t.Object({
        content: t.String(),
      }),
    },
  )

  .get("/submit", () => {
    return <TodoForm />;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

const BaseHTML = ({ children }: elements.Children) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Beth Notes</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/htmx.org@1.9.9" integrity="sha384-QFjmbokDn2DjBjq+fM+8LUIVrAgqcNW2s0PjAxHETgRn9l4fvX31ZxDxvwQnyMOX" crossorigin="anonymous"></script>
  </head>
${children}
</html>
`;

type Todo = {
  id: number;
  content: string;
  completed: boolean;
};

const db: Todo[] = [
  { id: 1, content: "Learn HTMX", completed: false },
  { id: 2, content: "Get good at TypeSript", completed: false },
];

function getLastID() {
  if (db.length == 0) {
    return 0;
  }
  return db[db.length - 1].id;
}

function TodoItem({ id, content, completed }: Todo) {
  return (
    <li class="todo flex flex-row space-x-3">
      <p class={completed ? "line-through" : "bold"}>
        {id}: {content}
      </p>
      <input
        type="checkbox"
        checked={completed}
        hx-post={`/todos/toggle/${id}`}
        hx-target="closest .todo"
        hx-swap="outerHTML"
      />
      <button
        class="text-red-500 bold text-2xl"
        hx-delete={`/todos/${id}`}
        hx-target="closest .todo"
        hx-swap="outerHTML"
      >
        X
      </button>
    </li>
  );
}

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <div id="todos_container">
      <ul id="todo_list">
        {todos.map((todo) => (
          <TodoItem {...todo} />
        ))}
      </ul>
      <TodoForm />
    </div>
  );
}

function TodoForm() {
  return (
    <form
      id="todo_form"
      class="flex flex-row space-x-3"
      hx-post="/todos"
      hx-target="#todo_list"
      hx-swap="beforeend"
    >
      <input
        id="input_todo"
        type="text"
        name="content"
        class="border rounded-md border-gray-500 px-3 w-auto"
        placeholder="Add a todo"
        hx-get="/submit"
        hx-target="#todo_form"
        hx-swap="outerHTML"
        hx-trigger="submit"
      />
      <button
        type="submit"
        class="bg-green-600 text-[1.2rem] bold text-white rounded-lg px-3 shadow"
      >
        +
      </button>
    </form>
  );
}
