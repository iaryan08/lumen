"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_BASE = "http://localhost:8000";

export default function StudyMode() {
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
      const res = await fetch(`${API_BASE}/ingest/document`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await fetchCollections();
        setFile(null);
        setCollectionName("");
        alert("Document uploaded successfully!");
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
    <div className="flex h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/5 bg-[#09090b] flex flex-col z-10 shadow-2xl">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Lumen</h1>
          </div>
          <p className="text-sm text-gray-400 font-medium ml-11">Study Mode</p>
        </div>
        
        <ScrollArea className="flex-1 px-4 mt-6">
          <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Collections</h2>
          <div className="space-y-1">
            {collections.map((col: any) => (
              <button
                key={col.id}
                onClick={() => { setActiveCollection(col); setMessages([]); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${activeCollection?.id === col.id ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <div className={`font-semibold text-sm ${activeCollection?.id === col.id ? 'text-blue-400' : 'text-gray-200 group-hover:text-white'}`}>{col.name}</div>
                <div className="text-[11px] mt-1 opacity-60 truncate">{col.document}</div>
              </button>
            ))}
            {collections.length === 0 && (
              <div className="px-2 py-4 text-xs text-gray-600 italic">No collections yet. Upload a document below.</div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <Card className="bg-[#121214] border-white/10 text-white shadow-lg">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-gray-200">New Document</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <form onSubmit={handleUpload} className="space-y-3">
                <Input 
                  placeholder="Subject Name (e.g. History 101)" 
                  value={collectionName} 
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="bg-black/50 border-white/10 h-9 text-sm focus-visible:ring-blue-500/50 rounded-lg placeholder:text-gray-600"
                />
                <Input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-black/50 border-white/10 h-9 text-xs cursor-pointer file:text-xs file:bg-transparent file:text-gray-300 file:font-medium file:border-0 hover:file:text-white rounded-lg px-2 py-1.5"
                />
                <Button type="submit" disabled={loading || !file || !collectionName} className="w-full h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/20 rounded-lg transition-all active:scale-[0.98]">
                  {loading ? 'Processing...' : 'Upload & Embed'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#050505] relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 blur-[120px] pointer-events-none rounded-full"></div>

        {activeCollection ? (
          <>
            <div className="h-16 border-b border-white/5 flex items-center px-8 bg-[#09090b]/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </div>
                <span className="font-semibold text-sm text-gray-200">Chatting with {activeCollection.name}</span>
                <span className="text-xs text-gray-600 ml-2 border border-gray-800 rounded-md px-2 py-0.5">{activeCollection.document}</span>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-8 z-10">
              <div className="max-w-4xl mx-auto space-y-8 pb-10">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-gray-500 mt-32">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-500/80">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-300">Start the conversation</p>
                    <p className="text-sm mt-2 text-gray-500 max-w-sm text-center">Ask questions about the uploaded document, request summaries, or have Lumen explain complex topics.</p>
                  </div>
                )}
                
                {messages.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mr-4 shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400">
                          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75z" />
                        </svg>
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-2xl p-5 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-[#121214] border border-white/5 text-gray-200 shadow-xl rounded-bl-sm'}`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                      
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-white/5">
                          <p className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            Sources Context
                          </p>
                          <div className="space-y-2">
                            {msg.citations.map((cite: any, idx: number) => (
                              <div key={idx} className="bg-black/40 rounded-xl p-3 text-xs text-gray-400 border border-white/5 hover:border-white/10 transition-colors">
                                <span className="text-indigo-400 font-medium mb-1 block">📄 {cite.source}</span>
                                <div className="pl-2 border-l-2 border-white/10 italic text-gray-500 line-clamp-3">
                                  "{cite.text.replace(/\s+/g, ' ').trim()}"
                                </div>
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
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400 animate-spin">
                          <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
                        </svg>
                      </div>
                    <span className="text-sm font-medium animate-pulse">Lumen is analyzing...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-20">
              <form onSubmit={handleQuery} className="max-w-4xl mx-auto relative group">
                <Textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Ask a question about ${activeCollection.name}...`}
                  className="w-full bg-[#121214] border-white/10 focus:border-blue-500/50 text-gray-200 rounded-2xl pl-5 pr-16 py-4 min-h-[64px] resize-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl shadow-black/50 text-[15px]"
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
                  className="absolute right-3 top-3 h-10 w-10 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-blue-900/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                  </svg>
                </Button>
              </form>
              <div className="text-center mt-3">
                <span className="text-[11px] text-gray-600 font-medium">Lumen can make mistakes. Verify important information from the citations.</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 z-10">
            <div className="w-20 h-20 rounded-3xl bg-[#121214] border border-white/5 flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"></div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-500 relative z-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-200 mb-2 tracking-tight">Study Mode</h2>
            <p className="max-w-md text-center text-sm text-gray-500 leading-relaxed">Select a collection from the sidebar or upload a new PDF/Markdown document to start asking questions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
