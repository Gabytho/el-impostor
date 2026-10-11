import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { WordPair } from "../domain/model/types";
import {
  loadCategories,
  loadWordPairs,
  addWordPair,
  updateWordPair,
  deleteWordPair,
} from "../data/storage/storage";
import { createId } from "../domain/logic/gameLogic";

export default function CategoryDetailScreen() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = loadCategories().find((c) => c.id === categoryId);

  const [pairs, setPairs] = useState<WordPair[]>(() =>
    loadWordPairs().filter((p) => p.categoryId === categoryId),
  );
  const [realWord, setRealWord] = useState("");
  const [impostorWord, setImpostorWord] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReal, setEditReal] = useState("");
  const [editImpostor, setEditImpostor] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!category) {
    return (
      <div className="screen">
        <p>Categoría no encontrada.</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/categories")}
        >
          Volver
        </button>
      </div>
    );
  }

  const handleAdd = () => {
    const real = realWord.trim();
    const imp = impostorWord.trim();
    if (!real || !imp) return;
    const newPair: WordPair = {
      id: `wp_${createId()}`,
      categoryId: category.id,
      realWord: real,
      impostorWord: imp,
    };
    addWordPair(newPair);
    setPairs((prev) => [...prev, newPair]);
    setRealWord("");
    setImpostorWord("");
  };

  const handleStartEdit = (pair: WordPair) => {
    setEditingId(pair.id);
    setEditReal(pair.realWord);
    setEditImpostor(pair.impostorWord);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const real = editReal.trim();
    const imp = editImpostor.trim();
    if (!real || !imp) return;
    const pair = pairs.find((p) => p.id === editingId);
    if (!pair) return;
    const updated = { ...pair, realWord: real, impostorWord: imp };
    updateWordPair(updated);
    setPairs((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteWordPair(id);
    setPairs((prev) => prev.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
  };

  return (
    <div className="screen categories-screen">
      <header className="screen-header">
        <button className="btn-icon" onClick={() => navigate("/categories")}>
          ←
        </button>
        <h2>{category.name}</h2>
        <span style={{ width: 40 }} />
      </header>

      <section className="card">
        <div className="card-header">
          <h3>Agregar palabra</h3>
        </div>
        <input
          className="input"
          placeholder="Palabra real"
          value={realWord}
          maxLength={24}
          onChange={(e) => setRealWord(e.target.value)}
        />
        <input
          className="input"
          placeholder="Palabra del impostor"
          value={impostorWord}
          maxLength={24}
          onChange={(e) => setImpostorWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          className="btn btn-primary btn-block"
          disabled={!realWord.trim() || !impostorWord.trim()}
          onClick={handleAdd}
        >
          Agregar par
        </button>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Pares de palabras</h3>
          <span className="badge">{pairs.length}</span>
        </div>

        {pairs.length === 0 ? (
          <p className="hint center">
            Todavía no hay palabras en esta categoría.
          </p>
        ) : (
          <div className="pair-list">
            {pairs.map((pair) => {
              const isEditing = editingId === pair.id;
              const isConfirming = confirmDeleteId === pair.id;

              return (
                <div key={pair.id} className="pair-item">
                  {isEditing ? (
                    <>
                      <input
                        className="input"
                        value={editReal}
                        maxLength={24}
                        autoFocus
                        onChange={(e) => setEditReal(e.target.value)}
                      />
                      <input
                        className="input"
                        value={editImpostor}
                        maxLength={24}
                        onChange={(e) => setEditImpostor(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      />
                      <div className="pair-actions">
                        <button className="btn-icon" onClick={handleSaveEdit}>
                          ✓
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => setEditingId(null)}
                        >
                          ×
                        </button>
                      </div>
                    </>
                  ) : isConfirming ? (
                    <>
                      <span className="pair-real">{pair.realWord}</span>
                      <span className="pair-warning">¿Borrar?</span>
                      <div className="pair-actions">
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDelete(pair.id)}
                        >
                          ✓
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          ×
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="pair-words">
                        <span className="pair-real">{pair.realWord}</span>
                        <span className="pair-arrow">→</span>
                        <span className="pair-impostor">
                          {pair.impostorWord}
                        </span>
                      </div>
                      <div className="pair-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleStartEdit(pair)}
                        >
                          ✎
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => setConfirmDeleteId(pair.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
