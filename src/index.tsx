import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import * as elements from "typed-html";
import { SelectTodo, InsertTodo, todos } from "./db/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
            hx-swap="outerHTML"
            class="bg-gray-200 rounded-md shadow p-3"
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

  .post("/clicked", () => <p>👋 Greetings from the server</p>)

  .get("/todos", async () => {
    const data = await db.select().from(todos).all();
    return <TodoList todos={data} />;
  })

  .post(
    "/todos/toggle/:id",
    async ({ params }) => {
      const oldTodo = await db
        .select()
        .from(todos)
        .where(eq(todos.id, params.id))
        .get();
      const newTodo = await db
        .update(todos)
        .set({ completed: !oldTodo?.completed })
        .where(eq(todos.id, params.id))
        .returning()
        .get();
      return <TodoItem {...newTodo} />;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
  )

  .delete(
    "/todos/:id",
    async ({ params }) => {
      await db.delete(todos).where(eq(todos.id, params.id)).run();
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
  )

  .post(
    "/todos",
    async ({ body }) => {
      if (body.content.length == 0) {
        throw new Error("Content cannot be empty");
      }
      const newTodo = await db.insert(todos).values(body).returning().get();
      console.log(`Inserting: ${JSON.stringify(newTodo)}`);
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
    <script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
  </head>
${children}
</html> `;

function TodoItem({ id, content, completed }: SelectTodo) {
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

function TodoList({ todos }: { todos: SelectTodo[] }) {
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
      _="on submit target.reset()"
    >
      <input
        id="todo_input"
        type="text"
        name="content"
        placeholder="Add a todo"
        value=""
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
