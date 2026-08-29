import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from './firebase';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import JournalSidebar from './components/JournalSidebar';
import JournalEditor from './components/JournalEditor';
import GeminiChatDrawer from './components/GeminiChatDrawer';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [entries, setEntries] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setEntries([]);
        setActiveEntryId(null);
        setIsAuthModalOpen(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch entries from isolated partition: /users/{uid}/journals
  const loadEntries = async (userId) => {
    setEntriesLoading(true);
    try {
      const q = query(
        collection(db, 'users', userId, 'journals'),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(loaded);
      if (loaded.length > 0 && !activeEntryId) {
        setActiveEntryId(loaded[0].id);
      }
    } catch (err) {
      console.error("Failed to load user journals:", err);
    } finally {
      setEntriesLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadEntries(user.uid);
    }
  }, [user]);

  const activeEntry = entries.find(e => e.id === activeEntryId) || null;

  // Handle entry changes in local state
  const handleEntryChange = (field, value) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === activeEntryId) {
        return { ...entry, [field]: value };
      }
      return entry;
    }));
  };

  // Create new journal entry
  const handleCreateNewEntry = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const newId = `journal_${Date.now()}`;
    const newEntry = {
      id: newId,
      userId: user.uid,
      title: 'Untitled Reflection',
      content: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid, 'journals', newId), newEntry);
      setEntries([newEntry, ...entries]);
      setActiveEntryId(newId);
    } catch (err) {
      console.error("Failed to create new journal:", err);
      alert("Error creating entry. Make sure Firestore Security Rules are published.");
    }
  };

  // Save active entry to Cloud Firestore (zero-leakage user path)
  const handleSaveEntry = async () => {
    if (!user || !activeEntry) return;
    setIsSaving(true);

    try {
      const entryRef = doc(db, 'users', user.uid, 'journals', activeEntry.id);
      const payload = {
        userId: user.uid,
        title: activeEntry.title || 'Untitled Entry',
        content: activeEntry.content || '',
        summary: activeEntry.summary || null,
        cognitiveInsights: activeEntry.cognitiveInsights || null,
        updatedAt: serverTimestamp(),
      };

      await setDoc(entryRef, payload, { merge: true });
      console.log(`[Storage] Saved successfully to /users/${user.uid}/journals/${activeEntry.id}`);
    } catch (err) {
      console.error("Failed to save entry:", err);
      alert("Failed to save entry to Firestore: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'journals', id));
      const remaining = entries.filter(e => e.id !== id);
      setEntries(remaining);
      if (activeEntryId === id) {
        setActiveEntryId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  // Summarize Entry with Gemini API via Backend Proxy
  const handleSummarize = async () => {
    if (!user || !activeEntry) return;
    setIsSummarizing(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          journalContent: activeEntry.content,
        })
      });

      if (!res.ok) throw new Error(`Summary failed with status ${res.status}`);
      const summaryData = await res.json();

      // Update entry with summary and suggested title
      const updatedEntry = {
        ...activeEntry,
        title: activeEntry.title === 'Untitled Reflection' || !activeEntry.title ? summaryData.title : activeEntry.title,
        summary: summaryData
      };

      setEntries(prev => prev.map(e => e.id === activeEntry.id ? updatedEntry : e));

      // Auto-save to Firestore
      const entryRef = doc(db, 'users', user.uid, 'journals', activeEntry.id);
      await setDoc(entryRef, {
        userId: user.uid,
        title: updatedEntry.title,
        content: updatedEntry.content,
        summary: summaryData,
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (err) {
      console.error("Summarization error:", err);
      alert("Summarization failed: " + err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Phase 3 Feature Enhancement: Analyze Cognitive Clarity & Mood
  const handleAnalyzeCognitive = async () => {
    if (!user || !activeEntry || !activeEntry.content) return;
    setIsAnalyzingMood(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/cognitive-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          journalContent: activeEntry.content
        })
      });

      if (!res.ok) throw new Error(`Cognitive analysis failed with status ${res.status}`);
      const insightsData = await res.json();

      const updatedEntry = {
        ...activeEntry,
        cognitiveInsights: insightsData
      };

      setEntries(prev => prev.map(e => e.id === activeEntry.id ? updatedEntry : e));

      // Auto-save to Firestore
      const entryRef = doc(db, 'users', user.uid, 'journals', activeEntry.id);
      await setDoc(entryRef, {
        cognitiveInsights: insightsData,
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (err) {
      console.error("Cognitive insights error:", err);
      alert("Cognitive analysis failed: " + err.message);
    } finally {
      setIsAnalyzingMood(false);
    }
  };

  // Insert chat takeaway into current journal note
  const handleInsertToJournal = (text) => {
    if (!activeEntry) return;
    const current = activeEntry.content || '';
    const updated = current ? `${current}\n\n[Gemini Insight]:\n${text}` : `[Gemini Insight]:\n${text}`;
    handleEntryChange('content', updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar
        user={user}
        onSignOut={() => signOut(auth)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Isolated Journal Entries Sidebar */}
        <JournalSidebar
          entries={entries}
          activeId={activeEntryId}
          onSelect={(id) => setActiveEntryId(id)}
          onNew={handleCreateNewEntry}
          onDelete={handleDeleteEntry}
          loading={entriesLoading}
          user={user}
        />

        {/* Main Editor Canvas */}
        <JournalEditor
          entry={activeEntry}
          onChange={handleEntryChange}
          onSave={handleSaveEntry}
          onSummarize={handleSummarize}
          onAnalyzeCognitive={handleAnalyzeCognitive}
          isSaving={isSaving}
          isSummarizing={isSummarizing}
          isAnalyzingMood={isAnalyzingMood}
          user={user}
        />

        {/* Multi-turn AI Brainstorming Chat Drawer */}
        <GeminiChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          user={user}
          onInsertToJournal={handleInsertToJournal}
          backendUrl={BACKEND_URL}
        />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen && !user}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
