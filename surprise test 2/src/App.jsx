import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState("");
  const [list, setList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  
  const inputRef = useRef(null);
  const deleteCountRef = useRef(0);

  const handleAdd = () => {
    if (editIndex !== null) {
      const updatedList = [...list];
      updatedList[editIndex] = data;
      setList(updatedList);
      setEditIndex(null);
    } else {
      setList([...list, data]);
    }
    setData("");
    inputRef.current.focus();
  };

  const handleDelete = (index) => {
    deleteCountRef.current += 1;
    const newList = list.filter((_, i) => i !== index);
    setList(newList);
    inputRef.current.focus();
  };

  const handleEdit = (index) => {
    setData(list[index]);
    setEditIndex(index);
    inputRef.current.focus();
  };

  return (
    <div className="container">
      <h1>Note WebApp</h1>
      
      <div className="input-group">
        <input 
          type="text" 
          value={data} 
          ref={inputRef}
          onChange={(e) => setData(e.target.value)} 
          placeholder="Type something..."
        />

        {data.length > 0 && (
          <button onClick={handleAdd} className="btn-add">
            {editIndex !== null ? "Update" : "Add"}
          </button>
        )}
      </div>

      <div className="list-section">
        <h3>Notes List:</h3>
        {list.length === 0 ? <p className="empty-msg">No notes added yet.</p> : (
          <ul>
            {list.map((item, index) => (
              <li key={index}>
                <span className="note-text">{item}</span>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(index)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(index)} className="btn-delete">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
