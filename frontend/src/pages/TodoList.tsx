import { useState } from "react";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, title: "Learn React", completed: false },
    { id: 2, title: "Build Todo App", completed: true },
  ]);

  const [filter, setFilter] = useState("all");

  // toggle done
  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // delete todo
  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // filter logic
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Tasks</h1>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Task
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter("active")}
          className={`px-3 py-1 rounded ${
            filter === "active" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Active
        </button>

        <button
          onClick={() => setFilter("completed")}
          className={`px-3 py-1 rounded ${
            filter === "completed" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 && (
          <p className="text-gray-500">No tasks found</p>
        )}

        {filteredTodos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between p-4 bg-white shadow rounded-lg"
          >
            {/* Left */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5"
              />

              <span
                className={`${
                  todo.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {todo.title}
              </span>
            </div>

            {/* Actions */}
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}