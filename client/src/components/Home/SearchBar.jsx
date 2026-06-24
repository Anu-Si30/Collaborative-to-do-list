import React, { useState, useEffect, useRef } from 'react';
import { searchUsers, sendFriendRequest } from '../../services/userService';
import Toast from '../Shared/Toast';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchUsers(query);
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const handleAddFriend = async (userId) => {
    try {
      await sendFriendRequest(userId);
      setToastMsg('Friend request sent!');
    } catch (err) {
      setToastMsg(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="search-bar-container">
      {toastMsg && <Toast message={toastMsg} type="info" onClose={() => setToastMsg(null)} />}
      <div className="search-form">
        <input 
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Search users by name or email..." 
        />
        {loading && <span className="search-spinner">...</span>}
      </div>
      
      {results.length > 0 && (
        <div className="search-results">
          {results.map(u => (
            <div key={u._id} className="search-result-item">
              <div className="search-result-info">
                <div className="mini-avatar" style={{ borderColor: u.color }}>
                  {u?.username?.charAt(0)?.toUpperCase()}
                </div>
                <span>{u.username}</span>
              </div>
              <button className="btn btn-small" onClick={() => handleAddFriend(u._id)}>+</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
