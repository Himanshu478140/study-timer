import React, { useState, useEffect, useMemo } from 'react';
import { NotepadText, Trash2, Clock, Search, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface ScratchpadLog {
  id: string;
  timestamp: string;
  content: string;
}

export const ScratchpadLogsCard = () => {
  const [logs, setLogs] = useState<ScratchpadLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedDays, setCollapsedDays] = useState<{ [key: string]: boolean }>({});
  const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
  const [hoveredDayKey, setHoveredDayKey] = useState<string | null>(null);

  // Load logs on mount and listen to updates
  useEffect(() => {
    const loadLogs = () => {
      try {
        const saved = localStorage.getItem('scratchpad-logs');
        setLogs(saved ? JSON.parse(saved) : []);
      } catch (err) {
        console.error('Error loading scratchpad logs:', err);
      }
    };

    loadLogs();

    window.addEventListener('scratchpad-logs-updated', loadLogs);
    window.addEventListener('storage', loadLogs);

    return () => {
      window.removeEventListener('scratchpad-logs-updated', loadLogs);
      window.removeEventListener('storage', loadLogs);
    };
  }, []);

  const getFriendlyDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const getFormattedTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recent';
    }
  };

  // Group logs by day and apply search filter
  const groupedLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const filtered = sorted.filter(log => {
      if (!searchQuery.trim()) return true;
      const stripped = log.content.replace(/<[^>]*>/g, '').toLowerCase();
      return stripped.includes(searchQuery.toLowerCase());
    });

    const groups: { [key: string]: ScratchpadLog[] } = {};
    filtered.forEach(log => {
      const dateKey = new Date(log.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    return Object.entries(groups).map(([dateKey, entries]) => ({
      dateKey,
      friendlyDate: getFriendlyDate(dateKey),
      entries
    }));
  }, [logs, searchQuery]);

  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = logs.filter(log => log.id !== id);
    setLogs(updated);
    localStorage.setItem('scratchpad-logs', JSON.stringify(updated));
  };

  const handleDeleteDay = (dateKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete all entries for ${getFriendlyDate(dateKey)}?`)) {
      const updated = logs.filter(log => new Date(log.timestamp).toDateString() !== dateKey);
      setLogs(updated);
      localStorage.setItem('scratchpad-logs', JSON.stringify(updated));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all Scratchpad history logs? This cannot be undone.')) {
      setLogs([]);
      localStorage.setItem('scratchpad-logs', JSON.stringify([]));
    }
  };

  const toggleDay = (dateKey: string) => {
    setCollapsedDays(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  return (
    <section aria-labelledby="scratchpad-logs-title" style={{ marginTop: '2rem' }}>
      {/* Header section matching SessionHistoryCard */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(var(--color-accent-rgb), 0.1)',
            padding: '0.5rem',
            borderRadius: '0.625rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <NotepadText size={20} color="var(--color-accent)" />
          </div>
          <div>
            <h2 id="scratchpad-logs-title" style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>Scratchpad Logs</h2>
            <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>Chronological history of your scratchpad notes</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.375rem 0.75rem', borderRadius: '0.625rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{logs.length}</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase', fontWeight: 600, color: '#fff' }}>Total</span>
          </div>

          {logs.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                background: 'rgba(ef, 68, 68, 0.1)',
                border: '1px solid rgba(ef, 68, 68, 0.2)',
                color: '#ef4444',
                padding: '0.375rem 0.75rem',
                borderRadius: '0.625rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(ef, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(ef, 68, 68, 0.1)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(ef, 68, 68, 0.2)';
              }}
            >
              <Trash2 size={12} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search Bar block */}
      {logs.length > 0 && (
        <div style={{
          position: 'relative',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          width: '100%'
        }}>
          <Search size={14} style={{
            position: 'absolute',
            left: '0.75rem',
            color: 'rgba(255, 255, 255, 0.4)',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem 0.5rem 2.25rem',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(var(--color-accent-rgb), 0.3)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronDown size={14} style={{ transform: 'rotate(45deg)' }} />
            </button>
          )}
        </div>
      )}

      {/* Main card list */}
      <div className="widget-daily-tasks-container" style={{
        background: 'rgba(18, 18, 22, 0.85)',
        borderRadius: '1rem',
        border: '1px solid var(--color-glass-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'background var(--transition-theme), border-color var(--transition-theme)'
      }}>
        <div className="custom-scrollbar" style={{
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '1.25rem'
        }}>
          {groupedLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {groupedLogs.map(({ dateKey, friendlyDate, entries }) => {
                const isCollapsed = !!collapsedDays[dateKey];
                return (
                  <div
                    key={dateKey}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      transition: 'border-color 0.2s ease'
                    }}
                    onMouseEnter={() => setHoveredDayKey(dateKey)}
                    onMouseLeave={() => setHoveredDayKey(null)}
                  >
                    {/* Day Card Header */}
                    <div
                      onClick={() => toggleDay(dateKey)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isCollapsed ? <ChevronDown size={16} color="rgba(255,255,255,0.5)" /> : <ChevronUp size={16} color="rgba(255,255,255,0.5)" />}
                        <Calendar size={14} color="var(--color-accent)" style={{ opacity: 0.8 }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                          {friendlyDate}
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: 'rgba(255, 255, 255, 0.6)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '0.25rem',
                          fontWeight: 500
                        }}>
                          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {hoveredDayKey === dateKey && (
                          <button
                            onClick={(e) => handleDeleteDay(dateKey, e)}
                            title="Delete this entire day's logs"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'rgba(239, 68, 68, 0.6)',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              outline: 'none',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(239, 68, 68, 0.6)'}
                            onFocus={(e) => e.currentTarget.style.outline = '1px solid #ef4444'}
                            onBlur={(e) => e.currentTarget.style.outline = 'none'}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Day Entries List */}
                    {!isCollapsed && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                        paddingTop: '0.75rem',
                        animation: 'fadeIn 0.2s ease-out'
                      }}>
                        {entries.map((entry, idx) => (
                          <div
                            key={entry.id}
                            style={{
                              borderBottom: idx === entries.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                              paddingBottom: idx === entries.length - 1 ? '0' : '0.75rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem'
                            }}
                            onMouseEnter={() => setHoveredEntryId(entry.id)}
                            onMouseLeave={() => setHoveredEntryId(null)}
                          >
                            {/* Entry Header Info */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: 'rgba(255, 255, 255, 0.4)',
                                fontSize: '0.75rem'
                              }}>
                                <Clock size={10} />
                                <span>{getFormattedTime(entry.timestamp)}</span>
                              </div>

                              {hoveredEntryId === entry.id && (
                                <button
                                  onClick={(e) => handleDeleteEntry(entry.id, e)}
                                  title="Delete this snapshot"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.3)',
                                    cursor: 'pointer',
                                    padding: '0.125rem',
                                    borderRadius: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    outline: 'none',
                                    transition: 'color 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'}
                                  onFocus={(e) => e.currentTarget.style.outline = '1px solid #ef4444'}
                                  onBlur={(e) => e.currentTarget.style.outline = 'none'}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>

                            {/* Log Rendered Content */}
                            <div
                              className="scratchpad-log-content"
                              dangerouslySetInnerHTML={{ __html: entry.content }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              opacity: 0.4,
              fontSize: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <NotepadText size={32} opacity={0.2} />
              <span>{searchQuery ? 'No matching logs found.' : 'No scratchpad snapshots recorded yet.'}</span>
              {!searchQuery && (
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  Start typing in the Scratchpad to automatically save your notes here.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
