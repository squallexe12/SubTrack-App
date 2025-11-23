
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

import { Subscription, TRANSLATIONS, Language, TradeOffItem, TRADE_OFFS } from './types';
import { DashboardStats } from './components/DashboardStats';
import { SubscriptionList } from './components/SubscriptionList';
import { SubscriptionForm } from './components/SubscriptionForm';

// --- FIREBASE CONFIGURATION START ---
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
// --- FIREBASE CONFIGURATION END ---

// Initialize Firebase
let auth: any;
let db: any;
let firebaseInitError: string | null = null;

const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey.length > 0;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = firebaseAuth.getAuth(app);
    db = getFirestore(app);
    
    // Attempt offline persistence
    try {
        enableMultiTabIndexedDbPersistence(db).catch((err) => {
             console.warn('Persistence warning:', err.code);
        });
    } catch (e) {
        console.warn("Persistence initialization failed", e);
    }

  } catch (e: any) {
    console.error("Firebase Initialization Error:", e);
    firebaseInitError = e.message;
  }
}

const LANG_STORAGE_KEY = 'subtrack_lang_v1';
const THEME_STORAGE_KEY = 'subtrack_theme_v1';

const App: React.FC = () => {
  const [user, setUser] = useState<firebaseAuth.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false); // New state for subscription fetch
  const [loginError, setLoginError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  
  // Language & Theme State
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [tradeOffId, setTradeOffId] = useState<string>('coffee');

  // 1. Load Local Preferences (Theme & Lang)
  useEffect(() => {
    const storedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language;
    if (storedLang) setLanguage(storedLang);

    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark';
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  // 2. Apply Theme
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // 3. Save Language
  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, language);
    const items = TRADE_OFFS[language];
    if (items && items.length > 0) setTradeOffId(items[0].id);
  }, [language]);

  // 4. Auth Listener
  useEffect(() => {
    if (!auth) {
        setAuthLoading(false);
        return;
    }
    const unsubscribe = firebaseAuth.onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      setLoginError(null); 
    });
    return () => unsubscribe();
  }, []);

  // 5. Real-time Data Sync (CRITICAL FIX: STRICT PATH)
  useEffect(() => {
    if (!user || !db) {
        setSubscriptions([]);
        return;
    }

    setDataLoading(true);

    // Strictly query: users / {uid} / subscriptions
    // This ensures data separation and correct syncing across devices logged into same account.
    const userSubsCollection = collection(db, 'users', user.uid, 'subscriptions');
    const q = query(userSubsCollection);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs: Subscription[] = [];
      snapshot.forEach((doc) => {
        subs.push({ ...doc.data(), id: doc.id } as Subscription);
      });
      setSubscriptions(subs);
      setDataLoading(false);
    }, (error) => {
      console.error("Sync Error:", error);
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handlers
  const handleLogin = async () => {
    if (!auth) return alert("Firebase not configured.");
    setLoginError(null);
    setUnauthorizedDomain(null);
    
    const provider = new firebaseAuth.GoogleAuthProvider();
    try {
      await firebaseAuth.signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/configuration-not-found') {
        setLoginError("Configuration not found. Please enable 'Google' in Firebase Console > Authentication > Sign-in method.");
      } else if (error.code === 'auth/unauthorized-domain') {
        setUnauthorizedDomain(window.location.hostname);
      } else if (error.code === 'auth/popup-closed-by-user') {
        setLoginError("Login cancelled.");
      } else {
        setLoginError(error.message);
      }
    }
  };

  const handleLogout = () => {
    if (auth) firebaseAuth.signOut(auth);
  };

  const handleAddSubscription = async (newSub: Omit<Subscription, 'id'>) => {
    if (!user || !db) return;
    try {
      // Explicitly add to the user's collection
      await addDoc(collection(db, 'users', user.uid, 'subscriptions'), newSub);
      setIsFormOpen(false); // Close drawer
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Failed to save. Check your connection.");
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'subscriptions', id));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const t = TRANSLATIONS[language];

  // --- RENDER ---

  // 1. Config Missing Screen
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        {/* ... (Keep existing config error UI) ... */}
        <div className="glass-panel p-10 rounded-3xl text-center">
            <h1 className="text-xl font-bold text-red-500">Configuration Required</h1>
            <p className="text-[var(--text-secondary)]">Please set up Firebase in App.tsx</p>
        </div>
      </div>
    );
  }

  // 2. Loading Screen
  if (authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--input-bg)] border-t-[var(--accent-primary)]"></div>
        </div>
    );
  }

  // 3. Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] bg-[radial-gradient(ellipse_at_top,_var(--bg-gradient-from),_var(--bg-gradient-to))] flex flex-col items-center justify-center p-4">
         <div className="glass-panel max-w-md w-full rounded-3xl p-10 text-center animate-fade-in relative overflow-hidden shadow-2xl">
             <div className="absolute -top-20 -left-20 w-40 h-40 bg-[var(--accent-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
             <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--accent-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

             <div className="relative z-10">
                 <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--accent-primary)]/30">
                    <i className="fa-solid fa-cloud text-white text-2xl"></i>
                 </div>
                 <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">{t.login.welcome}</h1>
                 <p className="text-[var(--text-secondary)] mb-8">{t.login.desc}</p>
                 
                 {(firebaseInitError || loginError) && (
                     <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500 text-left break-words">
                         <strong>Error:</strong> {firebaseInitError || loginError}
                     </div>
                 )}
                 {unauthorizedDomain && (
                     <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left">
                         <h3 className="text-amber-500 font-bold text-sm mb-2">Domain Not Authorized</h3>
                         <code className="block bg-[var(--bg-primary)] p-2 rounded text-xs select-all mb-2">{unauthorizedDomain}</code>
                         <p className="text-[10px] text-[var(--text-secondary)]">Add this domain in Firebase Console &gt; Auth &gt; Settings.</p>
                     </div>
                 )}

                 <button 
                   onClick={handleLogin}
                   className="w-full py-4 px-6 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold rounded-xl hover:bg-[var(--accent-primary)] hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                 >
                   <i className="fa-brands fa-google"></i>
                   {t.login.btn}
                 </button>

                 <div className="mt-8 flex justify-center gap-3">
                    {(['en', 'tr', 'de', 'fr', 'es'] as Language[]).map(lang => (
                        <button key={lang} onClick={() => setLanguage(lang)} className={`text-xs font-bold uppercase px-2 py-1 rounded ${language === lang ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)]'}`}>
                            {lang}
                        </button>
                    ))}
                 </div>
             </div>
         </div>
      </div>
    );
  }

  // 4. Main Dashboard
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-[radial-gradient(ellipse_at_top,_var(--bg-gradient-from),_var(--bg-gradient-to))] font-sans selection:bg-[var(--accent-primary)] selection:text-white transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] p-2.5 rounded-xl shadow-lg">
              <i className="fa-solid fa-layer-group text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] hidden sm:block">
              {t.header.title}<span className="text-[var(--accent-primary)]">Track</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-[var(--input-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] flex items-center justify-center">
                <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
             </button>
             
             <div className="bg-[var(--input-bg)] rounded-lg p-1 flex border border-[var(--glass-border)]">
                <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="bg-transparent text-[var(--text-primary)] text-xs font-bold uppercase outline-none cursor-pointer px-1">
                    <option value="en" className="bg-[var(--bg-primary)]">EN</option>
                    <option value="tr" className="bg-[var(--bg-primary)]">TR</option>
                    <option value="de" className="bg-[var(--bg-primary)]">DE</option>
                    <option value="fr" className="bg-[var(--bg-primary)]">FR</option>
                    <option value="es" className="bg-[var(--bg-primary)]">ES</option>
                </select>
             </div>

            <div className="flex items-center gap-3 pl-2 border-l border-[var(--glass-border)]">
                {user.photoURL && <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-[var(--glass-border)]" />}
                <button onClick={handleLogout} className="text-sm text-[var(--text-secondary)] hover:text-red-400">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
            </div>

            <button onClick={() => setIsFormOpen(true)} className="hidden sm:flex items-center gap-2 bg-[var(--text-primary)] hover:bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:text-white px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg">
              <i className="fa-solid fa-plus"></i>
              <span className="font-medium">{t.header.addNew}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile FAB */}
      <button onClick={() => setIsFormOpen(true)} className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[var(--accent-primary)] text-white rounded-full shadow-xl flex items-center justify-center text-xl">
        <i className="fa-solid fa-plus"></i>
      </button>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24 sm:pb-10">
        
        {/* Loading Spinner for Data */}
        {dataLoading && (
            <div className="flex justify-center p-4">
                <div className="animate-spin h-6 w-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full"></div>
            </div>
        )}

        <DashboardStats 
          subscriptions={subscriptions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          language={language}
          tradeOffId={tradeOffId}
          setTradeOffId={setTradeOffId}
        />

        {/* DRAWER COMPONENT (Replaces Modal) */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
             {/* Backdrop */}
             <div 
               className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
               onClick={() => setIsFormOpen(false)}
             ></div>
             
             {/* Drawer Panel */}
             <div className="absolute inset-x-0 bottom-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[480px] w-full sm:h-full h-[85vh] flex">
                <SubscriptionForm 
                  onSubmit={handleAddSubscription} 
                  onCancel={() => setIsFormOpen(false)}
                  language={language}
                />
             </div>
          </div>
        )}

        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-list-check text-[var(--accent-primary)]"></i>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t.list.title}</h2>
              </div>
              <span className="text-sm text-[var(--text-secondary)] font-medium">
                {subscriptions.length} {t.list.active}
              </span>
            </div>
            
            <SubscriptionList 
              subscriptions={subscriptions} 
              onDelete={handleDeleteSubscription}
              viewMode={viewMode}
              language={language}
              tradeOffId={tradeOffId}
            />
        </div>
      </main>
    </div>
  );
};

export default App;
