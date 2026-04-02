import React, { useState } from 'react';
import '../styles/EventCategories.css';

const CATEGORIES = [
  { id: 'work', name: 'Work', color: '#3b82f6', bgColor: '#dbeafe' },
  { id: 'personal', name: 'Personal', color: '#10b981', bgColor: '#d1fae5' },
  { id: 'meeting', name: 'Meeting', color: '#f59e0b', bgColor: '#fef3c7' },
  { id: 'deadline', name: 'Deadline', color: '#ef4444', bgColor: '#fee2e2' },
  { id: 'other', name: 'Other', color: '#8b5cf6', bgColor: '#ede9fe' },
];

export default function EventCategories({ selectedCategory, onSelect }) {
  const [showMenu, setShowMenu] = useState(false);

  const selectedCat = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[4];

  return (
    <div className="category-selector">
      <label htmlFor="category">Category</label>
      <div className="category-dropdown" onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}>
        <button
          className="category-button"
          style={{
            backgroundColor: selectedCat.bgColor,
            color: selectedCat.color,
            borderColor: selectedCat.color,
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <span
            className="category-dot"
            style={{ backgroundColor: selectedCat.color }}
          ></span>
          {selectedCat.name}
        </button>
        {showMenu && (
          <div className="category-menu" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`category-option ${selectedCategory === cat.id ? 'selected' : ''}`}
                style={{
                  backgroundColor: cat.bgColor,
                  color: cat.color,
                  borderColor: cat.color,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(cat.id);
                  setShowMenu(false);
                }}
              >
                <span
                  className="category-dot"
                  style={{ backgroundColor: cat.color }}
                ></span>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { CATEGORIES };
