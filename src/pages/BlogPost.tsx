import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { sanitizeBlogContent, safeMarkdownComponents } from '../utils/sanitize';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  published: boolean;
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as BlogPost;
          if (data.published) {
            setPost({ id: docSnap.id, ...data });
          } else {
            setError('Post not found or unavailable.');
          }
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError('Failed to load post.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#050a30] text-white selection:bg-[#d4af37] selection:text-[#050a30]">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <Link 
          to="/blog" 
          className="inline-flex items-center text-gray-400 hover:text-[#d4af37] transition-colors mb-12 uppercase tracking-widest text-xs font-medium"
        >
          <ChevronLeft size={16} className="mr-2" /> Back to Blog
        </Link>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error || !post ? (
          <div className="text-center py-20 bg-[#0a1142] border border-white/5">
            <h1 className="text-2xl font-serif mb-4">{error || 'Post not found'}</h1>
            <Link to="/blog" className="text-[#d4af37] hover:underline">Return to blog</Link>
          </div>
        ) : (
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <header className="mb-12 border-b border-white/10 pb-12">
              <div className="text-[#d4af37] text-sm uppercase tracking-widest mb-6">
                {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : 'Recent'}
              </div>
              <h1 className="font-serif text-4xl md:text-6xl leading-tight mb-8">
                {post.title}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#0a1142] border border-[#d4af37]/30 flex items-center justify-center overflow-hidden">
                  <img src="/file_00000000a67872098bfee02714bfa0a7.png" alt="Saswat Kumar Rout" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium text-sm">Saswat Kumar Rout</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Advocate</p>
                </div>
              </div>
            </header>

            <div className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:text-[#d4af37] prose-p:text-gray-300 prose-p:font-light prose-p:leading-relaxed">
              <Markdown rehypePlugins={[rehypeRaw]} components={safeMarkdownComponents}>
                {sanitizeBlogContent(post.content)}
              </Markdown>
            </div>
          </motion.article>
        )}
      </main>
    </div>
  );
}
