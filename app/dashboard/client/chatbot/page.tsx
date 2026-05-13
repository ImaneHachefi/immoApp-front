'use client';
import { useEffect, useRef, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { Bot, User, Search, Heart, Users, TrendingUp, Map, MapPin, DollarSign, Ruler, Settings, MessageSquare, Send, Plus, Paperclip } from 'lucide-react';

interface Message {
  id: number; role: 'bot' | 'user'; content: string; biens?: Bien[]; timestamp: Date;
}

interface Bien {
  id: number; titre: string; prix: number; localisation: string;
  superficie: number; disponible: boolean; photos: { url: string; ordre: number }[];
}

interface SearchContext {
  localisation?: string; budget?: number; superficie?: number; type?: string;
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
      id: nextId(), role: 'bot',
      content: "Bonjour ! Je suis **LuxImmo AI**, votre assistant immobilier personnel. 🏠\n\nQue vous cherchiez à acheter, louer ou simplement explorer le marché, je suis là pour vous aider.\n\nComment puis-je vous assister aujourd'hui ?",
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addMessage = (role: 'bot' | 'user', content: string, biens?: Bien[]) => {
    setMessages(prev => [...prev, { id: nextId(), role, content, biens, timestamp: new Date() }]);
  };

  const callClaudeAPI = async (userMessage: string, context: SearchContext, history: Message[]): Promise<{ text: string; biens?: Bien[] }> => {
    const conversationHistory = history.slice(-8).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant', content: m.content,
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
          biensContext = `\n\nBIENS DISPONIBLES DANS LA BASE:\n` + foundBiens.map(b => `- ID:${b.id} | "${b.titre}" | ${b.localisation} | ${b.prix?.toLocaleString()} DH | ${b.superficie}m²`).join('\n');
        }
      } else {
        const res = await api.get('/api/biens/disponibles');
        foundBiens = res.data.slice(0, 3);
        if (foundBiens.length > 0) {
          biensContext = `\n\nBIENS DISPONIBLES:\n` + foundBiens.map(b => `- ID:${b.id} | "${b.titre}" | ${b.localisation} | ${b.prix?.toLocaleString()} DH | ${b.superficie}m²`).join('\n');
        }
      }
    } catch (e) {}

    const systemPrompt = `Tu es LuxImmo AI, un assistant immobilier expert et sympathique pour l'application LuxImmo au Maroc.
INSTRUCTIONS:
- Réponds dans la MÊME LANGUE que l'utilisateur (français, arabe, anglais, darija, etc.)
- Si quelqu'un dit "bonjour", "hello", "مرحبا" etc., réponds chaleureusement
- Pour les questions générales, réponds naturellement mais recentre sur l'immobilier
- Utilise **texte** pour mettre en gras les éléments importants
- Sois concis, professionnel mais chaleureux
- Contexte de recherche actuel: ${JSON.stringify(context)}
${biensContext}`;

    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 1000, system: systemPrompt, messages: [...conversationHistory, { role: 'user', content: userMessage }] }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const text = data.content?.[0]?.text || "Je n'ai pas pu traiter votre demande.";

    const shouldShowBiens = foundBiens.length > 0 && (
      userMessage.toLowerCase().includes('cherche') || userMessage.toLowerCase().includes('budget') || userMessage.toLowerCase().includes('appartement') || userMessage.toLowerCase().includes('villa') || context.localisation || context.budget
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
    setInput(''); setLoading(true); addMessage('user', userMessage);

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
        try { await api.post('/api/chatbot/recommander', { clientId, budgetMax: newCtx.budget || 99999999, localisation: newCtx.localisation || '', budgetMin: 0 }); } catch (err) {}
      }

      addMessage('bot', text, biens);
    } catch (err) {
      addMessage('bot', "Désolé, une erreur s'est produite. Veuillez réessayer. 🙏");
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const getPhoto = (b: Bien) => b.photos?.length > 0 && b.photos[0]?.url ? b.photos[0].url : 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80';
  const formatTime = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const renderText = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>').replace(/\n/g, '<br/>');

  const quickActions = [
    { icon: <Search className="w-3.5 h-3.5" />, label: 'Rechercher des biens', msg: 'Je cherche un bien immobilier' },
    { icon: <Heart className="w-3.5 h-3.5" />, label: 'Voir mes favoris', msg: 'Montre-moi mes propriétés sauvegardées' },
    { icon: <Users className="w-3.5 h-3.5" />, label: 'Contacter un agent', msg: 'Je voudrais contacter un agent immobilier' },
    { icon: <DollarSign className="w-3.5 h-3.5" />, label: 'Estimation de valeur', msg: 'Je voudrais estimer la valeur d\'un bien' },
  ];

  return (
    <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
      <div className="flex h-[calc(100vh-100px)] bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-lg">

        {/* LEFT SIDEBAR */}
        <div className="hidden md:flex flex-col w-64 bg-muted/30 border-r border-surface-border shrink-0">
          <div className="p-5 border-b border-surface-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">L</div>
              <span className="font-display font-semibold text-foreground text-lg">LuxImmo AI</span>
            </div>
          </div>

          <nav className="p-3 flex flex-col gap-1">
            {[
              { icon: <MessageSquare className="w-4 h-4" />, label: 'Conversations récentes', active: true },
              { icon: <Heart className="w-4 h-4" />, label: 'Propriétés sauvegardées' },
              { icon: <Users className="w-4 h-4" />, label: 'Contacts Agent' },
              { icon: <TrendingUp className="w-4 h-4" />, label: 'Tendances du marché' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
                {item.icon} {item.label}
              </div>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Recommandations Top</div>
            {savedBiens.slice(0, 3).map(b => (
              <div key={b.id} className="mb-4 cursor-pointer group">
                <div className="h-20 rounded-lg overflow-hidden mb-2">
                  <img src={getPhoto(b)} alt={b.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&q=80'; }} />
                </div>
                <div className="text-xs font-semibold text-foreground mb-1 leading-tight group-hover:text-primary transition-colors">{b.titre}</div>
                <div className="text-[11px] text-primary font-bold">{b.prix?.toLocaleString()} DH</div>
              </div>
            ))}
            {savedBiens.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-6">Vos recommandations<br />apparaîtront ici</div>
            )}
          </div>

          <div className="p-4 border-t border-surface-border">
            <button onClick={() => { setMessages([{ id: nextId(), role: 'bot', content: "Nouvelle recherche ! 🔄\n\nDites-moi ce que vous cherchez. Je peux vous aider à trouver la propriété idéale selon votre budget, localisation et préférences.", timestamp: new Date() }]); setSearchContext({}); setSavedBiens([]); }} 
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Nouvelle Recherche
            </button>
          </div>
        </div>

        {/* CENTER CHAT */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3.5 border-b border-surface-border flex justify-between items-center bg-surface">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center"><Bot className="w-5 h-5" /></div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">LuxImmo AI Assistant</div>
                <div className="text-[11px] font-medium text-emerald-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> En ligne & prêt à aider
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"><Settings className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="text-center py-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-3 py-1 rounded-full">Aujourd'hui</span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-5 custom-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1"><Bot className="w-4 h-4" /></div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted border border-surface-border text-foreground rounded-tl-sm'}`}>
                    <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderText(msg.content) }} />
                    <div className={`text-[10px] mt-2 text-right ${msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatTime(msg.timestamp)}</div>
                  </div>
                </div>

                {msg.biens && msg.biens.length > 0 && (
                  <div className="flex flex-col gap-3 w-full max-w-md pl-11 mt-3">
                    {msg.biens.slice(0, 3).map(b => (
                      <div key={b.id} className="bg-surface border border-surface-border rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer group">
                        <div className="relative h-32 overflow-hidden">
                          <img src={getPhoto(b)} alt={b.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80'; }} />
                          {b.disponible && (
                            <div className="absolute top-2 left-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary text-primary-foreground uppercase tracking-wider shadow-sm">Nouveau</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                        <div className="p-3.5">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-sm font-semibold text-foreground truncate">{b.titre}</span>
                            <span className="text-sm font-bold text-primary shrink-0">{b.prix?.toLocaleString()} DH</span>
                          </div>
                          <div className="flex gap-3 mb-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {b.localisation}</span>
                            <span className="flex items-center gap-1.5"><Ruler className="w-3 h-3" /> {b.superficie}m²</span>
                          </div>
                          <button className="w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg text-xs font-semibold transition-colors">
                            Voir les détails
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-[85%] animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"><Bot className="w-4 h-4" /></div>
                <div className="px-5 py-4 bg-muted border border-surface-border rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-5 pt-2 pb-3 flex gap-2 flex-wrap bg-surface">
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => handleSend(undefined, a.msg)} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-surface-border rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:border-primary/30 transition-all cursor-pointer">
                {a.icon} {a.label}
              </button>
            ))}
          </div>

          <div className="p-4 bg-surface border-t border-surface-border">
            <form onSubmit={handleSend} className="flex items-center gap-2 bg-muted border border-surface-border rounded-xl p-1.5 focus-within:border-primary/50 transition-colors shadow-sm">
              <button type="button" className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg transition-colors"><Paperclip className="w-4 h-4" /></button>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Posez votre question sur l'immobilier..." disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-sm text-foreground px-2" />
              <button type="submit" disabled={loading || !input.trim()} className="w-9 h-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-default">
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-muted-foreground">L'IA LuxImmo peut fournir des détails sur les quartiers, les écoles et les prix du marché.</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="hidden lg:flex flex-col w-64 bg-muted/30 border-l border-surface-border p-5 shrink-0 overflow-y-auto">
          <div className="mb-6">
            <div className="text-xs font-bold text-foreground mb-4">Recherche Actuelle</div>
            {[
              { icon: <MapPin className="w-4 h-4" />, label: 'Localisation', value: searchContext.localisation || '—' },
              { icon: <DollarSign className="w-4 h-4" />, label: 'Budget Max', value: searchContext.budget ? `${(searchContext.budget / 1000000).toFixed(1)}M DH` : '—' },
              { icon: <Ruler className="w-4 h-4" />, label: 'Superficie', value: searchContext.superficie ? `${searchContext.superficie}m²` : '—' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 mb-4">
                <div className="text-primary mt-0.5">{item.icon}</div>
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</div>
                  <div className={`text-xs font-medium ${item.value === '—' ? 'text-muted-foreground' : 'text-foreground'}`}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {searchContext.localisation && (
            <div className="mb-6 animate-in fade-in">
              <div className="text-xs font-bold text-foreground mb-3">Aperçu du Quartier</div>
              <div className="bg-surface border border-surface-border rounded-xl p-3 shadow-sm mb-3">
                <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">{searchContext.localisation}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">Ville dynamique avec un marché immobilier actif. Bonne connectivité et infrastructures en développement.</div>
              </div>
              <div className="h-24 bg-surface border border-surface-border rounded-xl flex items-center justify-center flex-col shadow-sm">
                <Map className="w-6 h-6 text-muted-foreground mb-1" />
                <div className="text-[10px] font-medium text-muted-foreground">{searchContext.localisation}</div>
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-bold text-foreground mb-3">Recherches Récentes</div>
            <div className="flex flex-col gap-2">
              {recentSearches.map((s, i) => (
                <button key={i} onClick={() => handleSend(undefined, s)} className="text-left text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                  <Search className="w-3 h-3" /> {s}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}