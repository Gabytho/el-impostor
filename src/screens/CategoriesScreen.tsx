import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../domain/model/types";
import {
  loadCategories,
  addCategory,
  deleteCategory,
  updateCategory,
  countWordsInCategory,
} from "../data/storage/storage";
import { createId } from "../domain/logic/gameLogic";

export default function CategoriesScreen() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>(() =>
    loadCategories(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newName, setNewName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [wordCounts, setWordCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    loadCategories().forEach((c) => {
      counts[c.id] = countWordsInCategory(c.id);
    });
    return counts;
  });

  const refreshCounts = () => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => {
      counts[c.id] = countWordsInCategory(c.id);
    });
    setWordCounts(counts);
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const newCategory: Category = {
      id: `cat_${createId()}`,
      name,
      isCustom: true,
    };
    const next = addCategory(newCategory);
    setCategories(next);
    setNewName("");
    setTimeout(refreshCounts, 0);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) return;
    const cat = categories.find((c) => c.id === editingId);
    if (!cat) return;
    const next = updateCategory({ ...cat, name });
    setCategories(next);
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = (id: string) => {
    const next = deleteCategory(id);
    setCategories(next);
    setConfirmDeleteId(null);
    setTimeout(refreshCounts, 0);
  };

  return (
    <div className="screen categories-screen">
      <header className="screen-header">
        <button className="btn-icon" onClick={() => navigate("/")}>
          ←
        </button>
        <h2>Categorías</h2>
        <span style={{ width: 40 }} />
      </header>

      <section className="card">
        <div className="card-header">
          <h3>Nueva categoría</h3>
        </div>
        <div className="player-row">
          <input
            className="input"
            placeholder="Nombre de la categoría"
            value={newName}
            maxLength={24}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            className="btn-icon"
            disabled={!newName.trim()}
            onClick={handleAdd}
          >
            +
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Todas las categorías</h3>
          <span className="badge">{categories.length}</span>
        </div>
        <div className="category-list">
          {categories.map((cat) => {
            const isEditing = editingId === cat.id;
            const isConfirming = confirmDeleteId === cat.id;
            const wordCount = wordCounts[cat.id] ?? 0;

            return (
              <div key={cat.id} className="category-item">
                {isEditing ? (
                  <>
                    <input
                      className="input"
                      value={editingName}
                      maxLength={24}
                      autoFocus
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button className="btn-icon" onClick={handleSaveEdit}>
                      ✓
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => setEditingId(null)}
                    >
                      ×
                    </button>
                  </>
                ) : isConfirming ? (
                  <>
                    <span className="category-name warning">
                      ¿Borrar "{cat.name}"?
                    </span>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(cat.id)}
                    >
                      ✓
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="category-main"
                      onClick={() => navigate(`/categories/${cat.id}`)}
                    >
                      <span className="category-name">{cat.name}</span>
                      <span className="category-count">
                        {wordCount} {wordCount === 1 ? "palabra" : "palabras"}
                      </span>
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleStartEdit(cat)}
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => setConfirmDeleteId(cat.id)}
                      title="Borrar"
                    >
                      🗑
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
