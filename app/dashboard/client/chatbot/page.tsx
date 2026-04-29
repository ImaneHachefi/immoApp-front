'use client';
import { useEffect, useRef, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';

interface Message {
  id: number;
  role: 'bot' | 'user';
  content: string;
  biens?: Bien[];
  timestamp: Date;
}

interface Bien {
  id: number;
  titre: string;
  prix: number;
  localisation: string;
  superficie: number;
  disponible: boolean;
  photos: { url: string; ordre: number }[];
}

interface SearchContext {
  localisation?: string;
  budget?: number;
  superficie?: number;
  type?: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [searchContext, setSearchContext] = useState<SearchContext>({});
  const [savedBiens, setSavedBiens] = useState<Bien[]>([]);
  const [recentSearches] = useState(['Villas à Casablanca', 'Appartements Rabat', 'Studios Marrakech']);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgId = useRef(0);

  const nextId = () => ++msgId.current;

  useEffect(() => {
    api.get('/api/auth/me').then(r => setClientId(r.data.id)).catch(() => {});

    setMessages([{
      id: nextId(),
      role: 'bot',
      content: "Bonjour ! Je suis **SupHouse AI**, votre assistant immobilier personnel. 🏠\n\nQue vous cherchiez à acheter, louer ou simplement explorer le marché, je suis là pour vous aider.\n\nComment puis-je vous assister aujourd'hui ?",
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role: 'bot' | 'user', content: string, biens?: Bien[]) => {
    setMessages(prev => [...prev, { id: nextId(), role, content, biens, timestamp: new Date() }]);
  };

  const callClaudeAPI = async (userMessage: string, context: SearchContext, history: Message[]): Promise<{ text: string; biens?: Bien[] }> => {
    const conversationHistory = history.slice(-8).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    let biensContext = '';
    let foundBiens: Bien[] = [];

    try {
      if (context.localisation || context.budget) {
        const params: any = {};
        if (context.localisation) params.localisation = context.localisation;
        if (context.budget) { params.prixMin = 0; params.prixMax = context.budget; }
        else { params.prixMin = 0; params.prixMax = 99999999; }

        const res = await api.get('/api/biens/recherche', { params });
        foundBiens = res.data.slice(0, 5);
        if (foundBiens.length > 0) {
          biensContext = `\n\nBIENS DISPONIBLES DANS LA BASE:\n` + foundBiens.map(b =>
            `- ID:${b.id} | "${b.titre}" | ${b.localisation} | ${b.prix?.toLocaleString()} DH | ${b.superficie}m²`
          ).join('\n');
        }
      } else {
        const res = await api.get('/api/biens/disponibles');
        foundBiens = res.data.slice(0, 3);
        if (foundBiens.length > 0) {
          biensContext = `\n\nBIENS DISPONIBLES:\n` + foundBiens.map(b =>
            `- ID:${b.id} | "${b.titre}" | ${b.localisation} | ${b.prix?.toLocaleString()} DH | ${b.superficie}m²`
          ).join('\n');
        }
      }
    } catch (e) {}

    const systemPrompt = `Tu es SupHouse AI, un assistant immobilier expert et sympathique pour l'application SupHouse au Maroc.

INSTRUCTIONS:
- Réponds dans la MÊME LANGUE que l'utilisateur (français, arabe, anglais, darija, etc.)
- Si quelqu'un dit "bonjour", "hello", "مرحبا" etc., réponds chaleureusement
- Pour les questions générales (météo, actualités, etc.), réponds naturellement mais recentre sur l'immobilier
- Utilise **texte** pour mettre en gras les éléments importants
- Sois concis, professionnel mais chaleureux
- Pour les questions sur les prix, superficie, localisation → extrais ces infos et propose des biens
- Si tu trouves des biens correspondants dans la liste, mentionne-les par leur titre et prix
- Contexte de recherche actuel: ${JSON.stringify(context)}
${biensContext}

CAPACITÉS:
- Répondre à toutes questions générales et immobilières
- Recommander des biens selon les critères
- Expliquer le marché immobilier marocain
- Donner des conseils d'achat/location
- Analyser les prix par ville
`;

    // ✅ FIX: Call our Next.js proxy instead of Anthropic directly
    // The proxy at /api/chat adds the API key server-side
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "Je n'ai pas pu traiter votre demande.";

    const shouldShowBiens = foundBiens.length > 0 && (
      userMessage.toLowerCase().includes('cherche') ||
      userMessage.toLowerCase().includes('budget') ||
      userMessage.toLowerCase().includes('appartement') ||
      userMessage.toLowerCase().includes('villa') ||
      userMessage.toLowerCase().includes('maison') ||
      userMessage.toLowerCase().includes('acheter') ||
      userMessage.toLowerCase().includes('louer') ||
      context.localisation ||
      context.budget
    );

    return { text, biens: shouldShowBiens ? foundBiens : undefined };
  };

  const extractContext = (text: string): Partial<SearchContext> => {
    const ctx: Partial<SearchContext> = {};
    const budgetMatch = text.match(/(\d[\d\s]*)\s*(dh|mad|dirham|millions?|k)/i);
    if (budgetMatch) {
      let val = parseFloat(budgetMatch[1].replace(/\s/g, ''));
      if (budgetMatch[2].toLowerCase().includes('million')) val *= 1000000;
      else if (budgetMatch[2].toLowerCase() === 'k') val *= 1000;
      ctx.budget = val;
    }
    const cities = ['casablanca', 'rabat', 'marrakech', 'fes', 'tanger', 'agadir', 'meknes', 'oujda', 'kenitra', 'sale'];
    const lower = text.toLowerCase();
    for (const city of cities) {
      if (lower.includes(city)) { ctx.localisation = city.charAt(0).toUpperCase() + city.slice(1); break; }
    }
    const supMatch = text.match(/(\d+)\s*m[²2]/i);
    if (supMatch) ctx.superficie = parseInt(supMatch[1]);
    return ctx;
  };

  const handleSend = async (e?: React.FormEvent, quickMessage?: string) => {
    e?.preventDefault();
    const userMessage = quickMessage || input.trim();
    if (!userMessage || loading) return;
    setInput('');
    setLoading(true);

    addMessage('user', userMessage);

    try {
      const newCtx = { ...searchContext, ...extractContext(userMessage) };
      setSearchContext(newCtx);
      const { text, biens } = await callClaudeAPI(userMessage, newCtx, messages);

      if (biens && biens.length > 0) {
        const newSaved = [...savedBiens];
        biens.forEach(b => { if (!newSaved.find(s => s.id === b.id)) newSaved.push(b); });
        setSavedBiens(newSaved.slice(0, 6));
      }

      if (clientId && (newCtx.budget || newCtx.localisation)) {
        try {
          await api.post('/api/chatbot/recommander', {
            clientId,
            budgetMax: newCtx.budget || 99999999,
            localisation: newCtx.localisation || '',
            budgetMin: 0,
          });
        } catch (err) {}
      }

      addMessage('bot', text, biens);
    } catch (err) {
      addMessage('bot', "Désolé, une erreur s'est produite. Veuillez réessayer. 🙏");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const getPhoto = (b: Bien) =>
    b.photos?.length > 0 && b.photos[0]?.url
      ? b.photos[0].url
      : 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80';

  const formatTime = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const renderText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#93c5fd">$1</strong>')
               .replace(/\n/g, '<br/>');
  };

  const quickActions = [
    { icon: '🔍', label: 'Rechercher des biens', msg: 'Je cherche un bien immobilier' },
    { icon: '⭐', label: 'Voir mes favoris', msg: 'Montre-moi mes propriétés sauvegardées' },
    { icon: '📞', label: 'Contacter un agent', msg: 'Je voudrais contacter un agent immobilier' },
    { icon: '💰', label: 'Estimation de valeur', msg: 'Je voudrais estimer la valeur d\'un bien' },
  ];

  return (
    <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:0.4; transform:scale(0.8); } 50% { opacity:1; transform:scale(1); } }
        .msg-anim { animation: fadeSlideUp 0.3s ease; }
        .dot1 { animation: pulse 1.4s 0s infinite; }
        .dot2 { animation: pulse 1.4s 0.2s infinite; }
        .dot3 { animation: pulse 1.4s 0.4s infinite; }
        .quick-btn:hover { background: rgba(99,157,255,0.15) !important; border-color: rgba(99,157,255,0.4) !important; }
        .bien-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .send-btn:hover:not(:disabled) { background: #2563eb !important; transform: scale(1.05); }
        .input-field:focus { border-color: rgba(99,157,255,0.4) !important; }
        .sidebar-item:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      <div style={{
        display: 'flex', height: 'calc(100vh - 40px)',
        fontFamily: "'Inter', sans-serif", gap: 0,
        background: '#0d1117', borderRadius: 16, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>

        {/* LEFT SIDEBAR */}
        <div style={{ width: 240, background: '#0a0f16', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

          <div style={{ padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>S</div>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#f0f6ff', letterSpacing: '-0.02em' }}>SupHouse</span>
            </div>
          </div>

          <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { icon: '💬', label: 'Recent Chats', active: true },
              { icon: '❤️', label: 'Saved Properties' },
              { icon: '👥', label: 'Agent Contacts' },
              { icon: '📊', label: 'Market Trends' },
            ].map((item, i) => (
              <div key={i} className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, cursor: 'pointer', background: item.active ? 'rgba(59,130,246,0.12)' : 'transparent', color: item.active ? '#93c5fd' : 'rgba(240,246,255,0.5)', fontSize: 13, fontWeight: item.active ? 500 : 400, transition: 'background 0.2s' }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          <div style={{ padding: '12px 14px', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(240,246,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>TOP RECOMMENDATIONS</div>
            {savedBiens.slice(0, 3).map(b => (
              <div key={b.id} style={{ marginBottom: 12, cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.8'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                <div style={{ height: 80, borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
                  <img src={getPhoto(b)} alt={b.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&q=80'; }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#f0f6ff', marginBottom: 2, lineHeight: 1.3 }}>{b.titre}</div>
                <div style={{ fontSize: 11, color: '#60a5fa' }}>{b.prix?.toLocaleString()} DH</div>
              </div>
            ))}
            {savedBiens.length === 0 && (
              <div style={{ fontSize: 12, color: 'rgba(240,246,255,0.2)', textAlign: 'center', padding: '20px 0' }}>
                Vos recommandations<br />apparaîtront ici
              </div>
            )}
          </div>

          <div style={{ padding: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => { setMessages([{ id: nextId(), role: 'bot', content: "Nouvelle recherche ! 🔄\n\nDites-moi ce que vous cherchez. Je peux vous aider à trouver la propriété idéale selon votre budget, localisation et préférences.", timestamp: new Date() }]); setSearchContext({}); setSavedBiens([]); }} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
              + New Search
            </button>
          </div>
        </div>

        {/* CENTER CHAT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1117' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#1e40af,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: '#22c55e', border: '2px solid #0d1117' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f6ff' }}>SupHouse AI</div>
                <div style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  Online & Ready to help
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              {['⚙️', '👤'].map((icon, i) => (
                <span key={i} style={{ fontSize: 16, cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.5'}>{icon}</span>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <span style={{ fontSize: 11, color: 'rgba(240,246,255,0.25)', background: 'rgba(255,255,255,0.04)', padding: '3px 12px', borderRadius: 100 }}>TODAY</span>
          </div>

          <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map(msg => (
              <div key={msg.id} className="msg-anim" style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '78%' }}>
                  {msg.role === 'bot' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#1e40af,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginBottom: 2 }}>🤖</div>
                  )}
                  <div style={{
                    padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : '#161d27',
                    border: msg.role === 'bot' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    maxWidth: '100%',
                  }}>
                    <div style={{ fontSize: 13.5, color: '#f0f6ff', lineHeight: 1.65 }}
                      dangerouslySetInnerHTML={{ __html: renderText(msg.content) }} />
                    <div style={{ fontSize: 10, color: 'rgba(240,246,255,0.3)', marginTop: 6, textAlign: 'right' }}>{formatTime(msg.timestamp)}</div>
                  </div>
                </div>

                {msg.biens && msg.biens.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 480, paddingLeft: 38 }}>
                    {msg.biens.slice(0, 3).map(b => (
                      <div key={b.id} className="bien-card" style={{ background: '#161d27', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
                        <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                          <img src={getPhoto(b)} alt={b.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80'; }} />
                          <div style={{ position: 'absolute', top: 8, left: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: '#3b82f6', color: '#fff', letterSpacing: '0.05em' }}>NEW LISTING</span>
                          </div>
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,17,23,0.8) 0%, transparent 50%)' }} />
                        </div>
                        <div style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f6ff' }}>{b.titre}</span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#60a5fa', whiteSpace: 'nowrap', marginLeft: 8 }}>{b.prix?.toLocaleString()} DH</span>
                          </div>
                          <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                            <span style={{ fontSize: 11, color: 'rgba(240,246,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>📍 {b.localisation}</span>
                            <span style={{ fontSize: 11, color: 'rgba(240,246,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>📐 {b.superficie}m²</span>
                          </div>
                          <button style={{ width: '100%', padding: '9px', background: '#1d4ed8', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif", transition: 'background 0.2s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#2563eb'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1d4ed8'}>
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="msg-anim" style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#1e40af,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🤖</div>
                <div style={{ padding: '14px 18px', background: '#161d27', borderRadius: '4px 18px 18px 18px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`dot${i + 1}`} style={{ width: 7, height: 7, borderRadius: '50%', background: '#60a5fa' }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '8px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {quickActions.map((a, i) => (
              <button key={i} className="quick-btn" onClick={() => handleSend(undefined, a.msg)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, color: 'rgba(240,246,255,0.7)', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.2s' }}>
                <span>{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: '10px 20px 16px', background: '#0d1117', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#161d27', borderRadius: 14, padding: '6px 8px 6px 16px', border: '1px solid rgba(255,255,255,0.08)', transition: 'border-color 0.2s' }}
              onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,157,255,0.3)'}
              onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'}>
              <span style={{ fontSize: 18, cursor: 'pointer', opacity: 0.4 }}>📎</span>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                placeholder="Type your message about properties..." disabled={loading}
                className="input-field"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f6ff', fontFamily: "'Inter',sans-serif", fontSize: 14, padding: '8px 0' }} />
              <button type="submit" disabled={loading || !input.trim()} className="send-btn" style={{ width: 38, height: 38, borderRadius: 10, background: input.trim() ? '#2563eb' : 'rgba(255,255,255,0.06)', border: 'none', cursor: input.trim() ? 'pointer' : 'default', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.2s', flexShrink: 0 }}>
                ➤
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(240,246,255,0.2)' }}>SupHouse AI can provide details about neighbourhoods, schools, and market pricing.</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ width: 220, background: '#0a0f16', borderLeft: '1px solid rgba(255,255,255,0.05)', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20, flexShrink: 0, overflowY: 'auto' }}>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f6ff', marginBottom: 12 }}>Current Search</div>
            {[
              { icon: '📍', label: 'Location', value: searchContext.localisation || '—' },
              { icon: '💰', label: 'Budget', value: searchContext.budget ? `${(searchContext.budget / 1000000).toFixed(1)}M DH` : '—' },
              { icon: '📐', label: 'Superficie', value: searchContext.superficie ? `${searchContext.superficie}m²` : '—' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 14, marginTop: 1 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(240,246,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: item.value === '—' ? 'rgba(240,246,255,0.25)' : '#f0f6ff', fontWeight: item.value !== '—' ? 500 : 400 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {searchContext.localisation && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f6ff', marginBottom: 12 }}>Neighborhood Info</div>
              <div style={{ background: '#161d27', borderRadius: 10, padding: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{searchContext.localisation.toUpperCase()}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,246,255,0.5)', lineHeight: 1.6 }}>
                  Ville dynamique avec un marché immobilier actif. Bonne connectivité et infrastructures.
                </div>
              </div>
              <div style={{ marginTop: 10, height: 100, background: '#161d27', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24 }}>🗺️</div>
                  <div style={{ fontSize: 10, color: 'rgba(240,246,255,0.3)', marginTop: 4 }}>{searchContext.localisation}</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f6ff', marginBottom: 10 }}>Recherches récentes</div>
            {recentSearches.map((s, i) => (
              <div key={i} onClick={() => handleSend(undefined, s)} style={{ fontSize: 12, color: 'rgba(240,246,255,0.5)', padding: '7px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#60a5fa'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,246,255,0.5)'; }}>
                🔍 {s}
              </div>
            ))}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}