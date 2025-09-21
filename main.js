const API_BASE = "http://localhost:3000/api/todos";

async function fetchTodos() {
    const res = await fetch(API_BASE);
    const data = await res.json();
    return data.items || [];
}

async function createTodo(payload) {
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("생성 실패");
    return res.json();
}

async function updateTodo(id, payload) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("수정 실패");
    return res.json();
}

async function deleteTodo(id) {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("삭제 실패");
}

function render(items) {
    const list = document.getElementById("todo-list");
    list.innerHTML = "";
    for (const t of items) {
        const li = document.createElement("li");
        const title = document.createElement("span");
        title.textContent = `${t.title} (P${t.priority})`;
        const btnDone = document.createElement("button");
        btnDone.className = "link";
        btnDone.textContent = t.status === "done" ? "완료됨" : "완료";
        btnDone.disabled = t.status === "done";
        btnDone.onclick = async () => { await updateTodo(t._id, { status: "done" }); await bootstrap(); };
        const btnDel = document.createElement("button");
        btnDel.className = "link";
        btnDel.textContent = "삭제";
        btnDel.onclick = async () => { await deleteTodo(t._id); await bootstrap(); };
        li.appendChild(title);
        li.appendChild(btnDone);
        li.appendChild(btnDel);
        list.appendChild(li);
    }
}

async function bootstrap() {
    try {
        const items = await fetchTodos();
        render(items);
    } catch (e) {
        console.error(e);
    }
}

document.getElementById("todo-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const priority = Number(document.getElementById("priority").value);
    if (!title) return;
    await createTodo({ title, priority });
    document.getElementById("title").value = "";
    await bootstrap();
});

bootstrap();

