import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { 
  Plus, Edit2, Trash2, LogOut, FileText, Check, X, 
  Eye, ArrowLeft, Send, Bookmark
} from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Navbar from '../components/Navbar';
import RichTextEditor from '../components/RichTextEditor';
import { 
  sanitizeBlogContent, 
  safeMarkdownComponents 
} from '../utils/sanitize';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  createdAt: any;
  published: boolean;
  authorId: string;
}

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchPosts();
      } else {
        setPosts([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchPosts = () => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setPosts(postsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. You might not have permission.");
      setLoading(false);
    });
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to login.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSavePost = async (publishStatus: boolean) => {
    setError('');
    setSuccessMessage('');

    if (!currentPost.title || !currentPost.title.trim()) {
      setError('Please enter an article title.');
      return;
    }

    const contentHtml = currentPost.content || '';
    if (!contentHtml.trim() || contentHtml === '<p></p>') {
      setError('Please write some content for the article.');
      return;
    }

    setSaving(true);
    const cleanContent = sanitizeBlogContent(contentHtml);

    try {
      if (currentPost.id) {
        // Update existing post
        const postRef = doc(db, 'posts', currentPost.id);
        await updateDoc(postRef, {
          title: currentPost.title.trim(),
          content: cleanContent,
          excerpt: currentPost.excerpt ? currentPost.excerpt.trim() : '',
          published: publishStatus,
          updatedAt: serverTimestamp()
        });
        setSuccessMessage(publishStatus ? 'Post updated and published!' : 'Draft saved successfully!');
      } else {
        // Create new post
        await addDoc(collection(db, 'posts'), {
          title: currentPost.title.trim(),
          content: cleanContent,
          excerpt: currentPost.excerpt ? currentPost.excerpt.trim() : '',
          published: publishStatus,
          authorId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setSuccessMessage(publishStatus ? 'New post published successfully!' : 'Draft saved successfully!');
      }

      setIsEditing(false);
      setCurrentPost({});
      setShowPreviewModal(false);
    } catch (err: any) {
      console.error("Save error:", err);
      setError("Failed to save post. Please check permissions.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete post.");
    }
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentPost({ 
      title: '', 
      excerpt: '', 
      content: '', 
      published: false 
    });
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a30] flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050a30] text-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a1142] border border-white/10 p-12 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full border border-[#d4af37] flex items-center justify-center text-[#d4af37] mx-auto mb-6">
            <FileText size={24} />
          </div>
          <h1 className="font-serif text-3xl mb-4">Admin Portal</h1>
          <p className="text-gray-400 font-light mb-8">Sign in to manage your blog posts.</p>
          
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          
          <button 
            onClick={handleLogin}
            className="w-full bg-[#d4af37] text-[#050a30] px-8 py-4 uppercase tracking-widest text-sm font-bold hover:bg-white transition-colors"
          >
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a30] text-white selection:bg-[#d4af37] selection:text-[#050a30]">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl mb-2">Blog Editor & Dashboard</h1>
            <p className="text-gray-400 font-light text-sm">Logged in as {user.email}</p>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing && (
              <button 
                onClick={handleCreateNew}
                className="flex items-center px-6 py-3 bg-[#d4af37] text-[#050a30] uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors"
              >
                <Plus size={16} className="mr-2" /> New Post
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center px-5 py-3 border border-white/20 hover:border-white transition-colors uppercase tracking-widest text-xs font-bold"
            >
              <LogOut size={16} className="mr-2" /> Logout
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 mb-6 flex justify-between items-center rounded-sm">
            <p className="text-sm">{error}</p>
            <button onClick={() => setError('')}><X size={16} /></button>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 p-4 mb-6 flex justify-between items-center rounded-sm">
            <p className="text-sm">{successMessage}</p>
            <button onClick={() => setSuccessMessage('')}><X size={16} /></button>
          </div>
        )}

        {/* Visual Document Editor View */}
        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a1142] border border-white/10 p-6 md:p-8 rounded-sm"
          >
            {/* Editor Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10 mb-6">
              <div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center text-xs uppercase tracking-widest text-gray-400 hover:text-[#d4af37] transition-colors mb-2"
                >
                  <ArrowLeft size={14} className="mr-1" /> Back to all posts
                </button>
                <h2 className="font-serif text-2xl">
                  {currentPost.id ? 'Edit Article' : 'Compose New Article'}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Preview Button */}
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="flex items-center px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-gray-200 hover:text-white transition-colors text-xs font-medium uppercase tracking-wider rounded"
                  title="Preview how this article will appear on the public website"
                >
                  <Eye size={15} className="mr-2 text-[#d4af37]" /> Preview Article
                </button>

                {/* Save Draft Button */}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSavePost(false)}
                  className="flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-colors text-xs font-medium uppercase tracking-wider rounded disabled:opacity-50"
                  title="Save post as a private draft"
                >
                  <Bookmark size={15} className="mr-2 text-gray-300" /> Save Draft
                </button>

                {/* Publish Button */}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSavePost(true)}
                  className="flex items-center px-6 py-2.5 bg-[#d4af37] hover:bg-[#c49f2f] text-[#050a30] transition-colors text-xs font-bold uppercase tracking-widest rounded shadow-sm disabled:opacity-50"
                  title="Publish this article live to the website"
                >
                  <Send size={14} className="mr-2" /> Publish
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Title Field */}
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 block mb-2 font-medium">
                  Article Title
                </label>
                <input 
                  type="text" 
                  value={currentPost.title || ''}
                  onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
                  className="w-full bg-[#050a30] border border-white/10 px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-colors text-white text-xl md:text-2xl font-serif rounded-sm"
                  placeholder="Enter a descriptive headline..."
                  required
                />
              </div>
              
              {/* Excerpt Field */}
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 block mb-2 font-medium">
                  Brief Summary (Excerpt)
                </label>
                <textarea 
                  value={currentPost.excerpt || ''}
                  onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})}
                  rows={2}
                  className="w-full bg-[#050a30] border border-white/10 px-4 py-2.5 focus:outline-none focus:border-[#d4af37] transition-colors text-white text-sm resize-none font-light rounded-sm"
                  placeholder="A short 1-2 sentence preview for the blog listing page..."
                />
              </div>

              {/* Visual Rich-Text Document Editor */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs uppercase tracking-widest text-gray-400 font-medium">
                    Article Content
                  </label>
                  <span className="text-[11px] text-gray-400 font-light">
                    Visual Editor (Word / Docs Style)
                  </span>
                </div>

                <RichTextEditor 
                  initialContent={currentPost.content || ''}
                  onChange={(html) => setCurrentPost(prev => ({ ...prev, content: html }))}
                />
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-400">
                    Current Status: <span className={currentPost.published ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                      {currentPost.published ? 'Published' : 'Draft'}
                    </span>
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 border border-white/20 hover:border-white transition-colors uppercase tracking-widest text-xs font-bold rounded"
                  >
                    Cancel
                  </button>

                  <button 
                    type="button"
                    disabled={saving}
                    onClick={() => handleSavePost(false)}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white uppercase tracking-widest text-xs font-bold rounded disabled:opacity-50"
                  >
                    Save Draft
                  </button>

                  <button 
                    type="button"
                    disabled={saving}
                    onClick={() => handleSavePost(true)}
                    className="px-8 py-2.5 bg-[#d4af37] hover:bg-[#c49f2f] text-[#050a30] uppercase tracking-widest text-xs font-bold transition-colors rounded shadow-sm disabled:opacity-50"
                  >
                    Publish
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Post Table View */
          <div className="bg-[#0a1142] border border-white/5 overflow-hidden rounded-sm">
            {posts.length === 0 ? (
              <div className="p-16 text-center text-gray-400 font-light">
                <FileText size={36} className="mx-auto text-gray-500 mb-3" />
                <p className="text-lg font-serif mb-2">No posts found</p>
                <p className="text-sm text-gray-400 mb-6">Create your first blog post to get started.</p>
                <button 
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-[#d4af37] text-[#050a30] uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors"
                >
                  Create Post
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-400 bg-white/5">
                      <th className="p-6 font-medium">Title</th>
                      <th className="p-6 font-medium">Status</th>
                      <th className="p-6 font-medium">Date</th>
                      <th className="p-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-6 font-serif text-lg max-w-md truncate">
                          {post.title}
                        </td>
                        <td className="p-6">
                          {post.published ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-amber-950/60 text-amber-400 border border-amber-800/40">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="p-6 text-sm text-gray-400 font-light whitespace-nowrap">
                          {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                        </td>
                        <td className="p-6 text-right whitespace-nowrap">
                          <button 
                            onClick={() => handleEdit(post)}
                            className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors mr-2 rounded hover:bg-white/5"
                            title="Edit post in visual document editor"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-white/5"
                            title="Delete post"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Live Article Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#050a30] border border-[#d4af37]/40 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl rounded-sm overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="bg-[#0a1142] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-pulse" />
                  <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                    Live Public Article Preview
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Article Preview Body (Mirrors BlogPost.tsx layout) */}
              <div className="flex-1 overflow-y-auto p-6 md:p-12 text-white">
                <header className="mb-10 border-b border-white/10 pb-8">
                  <div className="text-[#d4af37] text-xs uppercase tracking-widest mb-4">
                    {format(new Date(), 'MMMM d, yyyy')} • Preview
                  </div>
                  <h1 className="font-serif text-3xl md:text-5xl leading-tight mb-6">
                    {currentPost.title || 'Untitled Article'}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-full bg-[#0a1142] border border-[#d4af37]/30 flex items-center justify-center overflow-hidden">
                      <img 
                        src="/file_00000000a67872098bfee02714bfa0a7.png" 
                        alt="Saswat Kumar Rout" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Saswat Kumar Rout</p>
                      <p className="text-xs text-gray-400 uppercase tracking-widest">Advocate</p>
                    </div>
                  </div>
                </header>

                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:text-[#d4af37] prose-p:text-gray-300 prose-p:font-light prose-p:leading-relaxed">
                  {currentPost.content && currentPost.content !== '<p></p>' ? (
                    <Markdown rehypePlugins={[rehypeRaw]} components={safeMarkdownComponents}>
                      {sanitizeBlogContent(currentPost.content)}
                    </Markdown>
                  ) : (
                    <p className="text-gray-500 italic">No content written yet.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="bg-[#0a1142] px-6 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-5 py-2 border border-white/20 hover:border-white text-xs uppercase tracking-widest font-semibold transition-colors rounded"
                >
                  Return to Editor
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSavePost(false)}
                    className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs uppercase tracking-widest font-semibold transition-colors rounded"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSavePost(true)}
                    className="px-6 py-2 bg-[#d4af37] hover:bg-[#c49f2f] text-[#050a30] text-xs uppercase tracking-widest font-bold transition-colors rounded shadow-sm"
                  >
                    Publish Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
