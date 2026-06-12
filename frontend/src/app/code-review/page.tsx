"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_BASE = "http://localhost:8000";

export default function CodeMode() {
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${API_BASE}/collections`);
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !collectionName) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("collection_name", collectionName);

    try {
      const res = await fetch(`${API_BASE}/ingest/diff`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await fetchCollections();
        setFile(null);
        setCollectionName("");
        alert("Patch/Diff uploaded successfully!");
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Upload error", err);
    }
    setLoading(false);
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !activeCollection) return;
    
    const userMsg = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection_id: activeCollection.id,
          question: userMsg.content,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer, citations: data.citations }]);
    } catch (err) {
      console.error("Query error", err);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-white font-sans selection:bg-purple-500/30">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/5 bg-[#09090b] flex flex-col z-10 shadow-2xl">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path fillRule="evenodd" d="M14.447 3.026a.75.75 0 01.527.921l-4.5 16.5a.75.75 0 01-1.448-.394l4.5-16.5a.75.75 0 01.921-.527zM16.72 6.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 010-1.06zm-9.44 0a.75.75 0 010 1.06L2.56 12l4.72 4.72a.75.75 0 11-1.06 1.06L.97 12.53a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Lumen</h1>
          </div>
          <p className="text-sm text-gray-400 font-medium ml-11">Code Mode</p>
        </div>
        
        <ScrollArea className="flex-1 px-4 mt-6">
          <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Pull Requests</h2>
          <div className="space-y-1">
            {collections.map((col: any) => (
              <button
                key={col.id}
                onClick={() => { setActiveCollection(col); setMessages([]); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${activeCollection?.id === col.id ? 'bg-purple-600/10 text-purple-400' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <div className={`font-semibold text-sm ${activeCollection?.id === col.id ? 'text-purple-400' : 'text-gray-200 group-hover:text-white'}`}>{col.name}</div>
                <div className="text-[11px] mt-1 opacity-60 truncate font-mono">{col.document}</div>
              </button>
            ))}
            {collections.length === 0 && (
              <div className="px-2 py-4 text-xs text-gray-600 italic">No PRs yet. Upload a patch below.</div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <Card className="bg-[#121214] border-white/10 text-white shadow-lg">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-gray-200">New Code Diff</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <form onSubmit={handleUpload} className="space-y-3">
                <Input 
                  placeholder="PR Title / ID" 
                  value={collectionName} 
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="bg-black/50 border-white/10 h-9 text-sm focus-visible:ring-purple-500/50 rounded-lg placeholder:text-gray-600"
                />
                <Input 
                  type="file" 
                  accept=".patch,.diff,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-black/50 border-white/10 h-9 text-xs cursor-pointer file:text-xs file:bg-transparent file:text-gray-300 file:font-medium file:border-0 hover:file:text-white rounded-lg px-2 py-1.5"
                />
                <Button type="submit" disabled={loading || !file || !collectionName} className="w-full h-9 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/20 rounded-lg transition-all active:scale-[0.98]">
                  {loading ? 'Processing...' : 'Analyze Diff'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#050505] relative">
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-purple-600/5 blur-[120px] pointer-events-none rounded-full"></div>

        {activeCollection ? (
          <>
            <div className="h-16 border-b border-white/5 flex items-center px-8 bg-[#09090b]/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </div>
                <span className="font-semibold text-sm text-gray-200">Reviewing {activeCollection.name}</span>
                <span className="text-xs font-mono text-gray-500 ml-2 border border-gray-800 rounded-md px-2 py-0.5 bg-black">{activeCollection.document}</span>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-8 z-10">
              <div className="max-w-4xl mx-auto space-y-8 pb-10">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-gray-500 mt-32">
                    <p className="text-lg font-medium text-gray-300">Ask for a code review summary</p>
                    <p className="text-sm mt-2 text-gray-500 max-w-sm text-center">Try asking: "What are the main changes in this PR?", or "Are there any obvious bugs or missing tests?"</p>
                  </div>
                )}
                
                {messages.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mr-4 shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-purple-400">
                           <path fillRule="evenodd" d="M14.447 3.026a.75.75 0 01.527.921l-4.5 16.5a.75.75 0 01-1.448-.394l4.5-16.5a.75.75 0 01.921-.527zM16.72 6.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 010-1.06zm-9.44 0a.75.75 0 010 1.06L2.56 12l4.72 4.72a.75.75 0 11-1.06 1.06L.97 12.53a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-2xl p-5 ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-[#121214] border border-white/5 text-gray-200 shadow-xl rounded-bl-sm'}`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                      
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-white/5">
                          <p className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                            Related Diff Snippets
                          </p>
                          <div className="space-y-2">
                            {msg.citations.map((cite: any, idx: number) => (
                              <div key={idx} className="bg-black/40 rounded-xl p-3 text-xs text-gray-400 border border-white/5 font-mono overflow-x-auto whitespace-pre">
                                {cite.text.substring(0, 300)}...
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start items-center gap-4 text-gray-500">
                    <span className="text-sm font-medium animate-pulse text-purple-400">Lumen is analyzing code...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-20">
              <form onSubmit={handleQuery} className="max-w-4xl mx-auto relative group">
                <Textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Ask a question about ${activeCollection.name} code changes...`}
                  className="w-full bg-[#121214] border-white/10 focus:border-purple-500/50 text-gray-200 rounded-2xl pl-5 pr-16 py-4 min-h-[64px] resize-none focus:ring-4 focus:ring-purple-500/10 transition-all shadow-xl shadow-black/50 text-[15px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleQuery(e);
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  disabled={loading || !query.trim()} 
                  size="icon"
                  className="absolute right-3 top-3 h-10 w-10 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-purple-900/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                  </svg>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 z-10">
            <div className="w-20 h-20 rounded-3xl bg-[#121214] border border-white/5 flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors"></div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-purple-500 relative z-10">
                <path fillRule="evenodd" d="M14.447 3.026a.75.75 0 01.527.921l-4.5 16.5a.75.75 0 01-1.448-.394l4.5-16.5a.75.75 0 01.921-.527zM16.72 6.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 010-1.06zm-9.44 0a.75.75 0 010 1.06L2.56 12l4.72 4.72a.75.75 0 11-1.06 1.06L.97 12.53a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-200 mb-2 tracking-tight">Code Review Mode</h2>
            <p className="max-w-md text-center text-sm text-gray-500 leading-relaxed">Upload a .patch or diff file to generate an AI review of the code changes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
