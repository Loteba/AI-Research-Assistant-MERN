// frontend/src/components/library/LibraryItemCard.js
import React from 'react';
import { FaFilePdf, FaLink } from 'react-icons/fa';
import './LibraryItemCard.css';

const LibraryItemCard = ({ item }) => {
  const tags = item?.tags ?? [];

  return (
    <div className="library-card">
      <div className="item-type-icon">
        {item.itemType === 'pdf' ? <FaFilePdf /> : <FaLink />}
      </div>
      <div className="item-content">
        <h4>{item.title}</h4>
        {item.summary && <p className="item-summary">{item.summary}</p>}
        {tags.length > 0 && (
          <div className="item-tags">
            {tags.map(tag => tag && <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}
      </div>
      <a href={item.link} target="_blank" rel="noopener noreferrer" className="open-link">
        Abrir
      </a>
    </div>
  );
};

export default LibraryItemCard;