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
          <h1 class="bold text-3xl">HTMX from Elysia, with Tailwind</h1>
          <button
            hx-post="/clicked"
            hx-swap="innerHTML"
            class="bg-gray-200 p-3"
          >
            Click me
          </button>
          <div
            class="bg-gray-200"
            hx-get="/todos"
            hx-trigger="load"
            hx-swap="outerHTML"
          />
        </body>
      </BaseHTML>,
    ),
  )
  .post("/clicked", () => <div class="p-3">Greetings from the server!</div>)
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
  { id: 1, content: "Learn HTML", completed: false },
  { id: 2, content: "Learn CSS", completed: false },
];

function TodoItem({ id, content, completed }: Todo) {
  return (
    <div class="todo flex flex-row space-x-3">
      <p class={completed ? "line-through" : "bold"}>{content}</p>
      <input
        type="checkbox"
        checked={completed}
        hx-post={`/todos/toggle/${id}`}
        hx-target="closest .todo"
        hx-swap="outerHTML"
      />
      <button class="text-red-500">X</button>
    </div>
  );
}

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem {...todo} />
      ))}
    </ul>
  );
}
