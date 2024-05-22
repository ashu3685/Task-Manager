import React, { useState } from "react";

const TodoItem = ({ todo, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todo.text);

  const handleDelete = () => {
    onDelete(todo.id);
  };

  const handleEdit = () => {
    console.log(isEditing);
    if (isEditing){
      onUpdate(todo.id, editedText);
      setIsEditing(!isEditing);
      //Window.location.reload();
    } else {
      setIsEditing(!isEditing);
    }

    
  };

  const handleChange = (e) => {
    console.log(e.target.value);
    setEditedText(e.target.value);
  };

  return (
    <div style={{ borderBottom: "1px solid #ccc", padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {isEditing ? (
        <input
          type="text"
          value={editedText}
          onChange={handleChange}
          style={{ padding: "5px", borderRadius: "5px", border: "1px solid #ccc", marginRight: "10px" }}
        />
      ) : (
        <p style={{ margin: 0, flexGrow: 1, textDecoration: todo.completed ? "line-through" : "none" }}>{todo.text}</p>
      )}
      <div>

        <button
          onClick={handleEdit}
          style={{ padding: "5px 10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", marginRight: "5px" }}
        >
          {isEditing ? "Save" : "Edit"}
        </button>
        <button
          onClick={handleDelete}
          style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "5px" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
