import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  
  const [currentUser, setCurrentUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({
    username: "",
    password: "",
  });

  
  const [notes, setNotes] = useState([]);
  const [trash, setTrash] = useState([]);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [viewTrash, setViewTrash] = useState(false);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  
  useEffect(() => {
    if (!currentUser) return;

    const savedNotes =
      JSON.parse(localStorage.getItem(`${currentUser}_notes`)) || [];
    const savedTrash =
      JSON.parse(localStorage.getItem(`${currentUser}_trash`)) || [];

    setNotes(savedNotes);
    setTrash(savedTrash);
  }, [currentUser]);

  
  useEffect(() => {
    if (!currentUser) return;

    localStorage.setItem(
      `${currentUser}_notes`,
      JSON.stringify(notes)
    );
    localStorage.setItem(
      `${currentUser}_trash`,
      JSON.stringify(trash)
    );
  }, [notes, trash, currentUser]);

  

  const signup = () => {
    if (!authData.username || !authData.password) return;

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find(
      (u) => u.username === authData.username
    );

    if (exists) {
      alert("User already exists");
      return;
    }

    const updatedUsers = [...users, authData];
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", authData.username);

    setCurrentUser(authData.username);
    setAuthData({ username: "", password: "" });
  };

  const login = () => {
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const valid = users.find(
      (u) =>
        u.username === authData.username &&
        u.password === authData.password
    );

    if (!valid) {
      alert("Invalid credentials");
      return;
    }

    localStorage.setItem("currentUser", valid.username);
    setCurrentUser(valid.username);
    setAuthData({ username: "", password: "" });
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setNotes([]);
    setTrash([]);
    setCurrentNoteId(null);
  };

  

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Untitled",
      content: "",
      date: new Date().toLocaleString(),
      pinned: false,
    };

    setNotes([newNote, ...notes]);
    setCurrentNoteId(newNote.id);
    setViewTrash(false);
  };

  const currentNote = notes.find(
    (note) => note.id === currentNoteId
  );

  const updateNote = (field, value) => {
    const updated = notes.map((note) =>
      note.id === currentNoteId
        ? { ...note, [field]: value }
        : note
    );
    setNotes(updated);
  };

  const manualSave = () => {
    if (!currentUser) return;

    localStorage.setItem(
      `${currentUser}_notes`,
      JSON.stringify(notes)
    );

    alert("Note Saved Successfully ✅");
  };

  const deleteNote = () => {
    const note = notes.find(
      (n) => n.id === currentNoteId
    );
    if (!note) return;

    setTrash([note, ...trash]);
    setNotes(notes.filter((n) => n.id !== currentNoteId));
    setCurrentNoteId(null);
  };

  const restoreNote = (id) => {
    const note = trash.find((n) => n.id === id);
    if (!note) return;

    setNotes([note, ...notes]);
    setTrash(trash.filter((n) => n.id !== id));
  };

  const togglePin = (id) => {
    const updated = notes.map((note) =>
      note.id === id
        ? { ...note, pinned: !note.pinned }
        : note
    );
    setNotes(updated);
  };

  

  const filteredNotes = notes
    .filter((note) =>
      note.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.pinned - a.pinned);

  

  if (!currentUser) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>{isLogin ? "Login" : "Signup"}</h2>

          <input
            type="text"
            placeholder="Username"
            value={authData.username}
            onChange={(e) =>
              setAuthData({
                ...authData,
                username: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={authData.password}
            onChange={(e) =>
              setAuthData({
                ...authData,
                password: e.target.value,
              })
            }
          />

          <button onClick={isLogin ? login : signup}>
            {isLogin ? "Login" : "Signup"}
          </button>

          <p onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? "No account? Signup"
              : "Already have account? Login"}
          </p>
        </div>
      </div>
    );
  }

  

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>📝 My Notes</h2>
          <button
            className="theme-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>

        <button className="new-btn" onClick={createNote}>
          + New Note
        </button>

        <input
          className="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="tabs">
          <button
            className={!viewTrash ? "active-tab" : ""}
            onClick={() => setViewTrash(false)}
          >
            Notes
          </button>
          <button
            className={viewTrash ? "active-tab" : ""}
            onClick={() => setViewTrash(true)}
          >
            Trash
          </button>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>

        <div className="notes-list">
          {!viewTrash &&
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`note-card ${
                  note.id === currentNoteId ? "active" : ""
                }`}
                onClick={() => setCurrentNoteId(note.id)}
              >
                <strong>{note.title}</strong>
                <small>{note.date}</small>

                <button
                  className="pin-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(note.id);
                  }}
                >
                  {note.pinned ? "📌" : "📍"}
                </button>
              </div>
            ))}

          {viewTrash &&
            trash.map((note) => (
              <div key={note.id} className="note-card">
                <strong>{note.title}</strong>
                <small>{note.date}</small>
                <button
                  className="restore-btn"
                  onClick={() => restoreNote(note.id)}
                >
                  Restore
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* EDITOR */}
      <div className="editor">
        <div style={{ marginBottom: "15px", fontWeight: "bold" }}>
          Welcome to My Notepad, {currentUser} 💖
        </div>

        {!viewTrash && currentNote ? (
          <>
            <input
              className="title-input"
              value={currentNote.title}
              onChange={(e) =>
                updateNote("title", e.target.value)
              }
            />

            <textarea
              value={currentNote.content}
              onChange={(e) =>
                updateNote("content", e.target.value)
              }
              placeholder="Start writing..."
            />

            <div className="editor-actions">
              <button
                className="save-btn"
                onClick={manualSave}
              >
                Save
              </button>

              <button
                className="delete-btn"
                onClick={deleteNote}
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <div className="empty">
            {viewTrash
              ? "Trash is Open"
              : "Select or Create a Note"}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;