import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  createdAt: any;
  published: boolean;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#050a30] text-white selection:bg-[#d4af37] selection:text-[#050a30]">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <span className="text-[#d4af37] uppercase tracking-widest text-sm font-medium block mb-4">Insights & Updates</span>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">Legal Blog</h1>
          <p className="text-gray-400 font-light leading-relaxed max-w-2xl text-lg">
            Stay informed with the latest legal developments, insights, and analysis from Saswat Kumar Rout.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-[#0a1142] border border-white/5">
            <p className="text-gray-400 font-light">No posts available at the moment. Check back soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-[#0a1142] border border-white/5 hover:border-[#d4af37]/50 transition-colors flex flex-col h-full"
              >
                <div className="p-8 flex-grow flex flex-col">
                  <div className="text-[#d4af37] text-xs uppercase tracking-widest mb-4">
                    {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : 'Recent'}
                  </div>
                  <h2 className="text-xl font-serif mb-4 group-hover:text-[#d4af37] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 font-light text-sm leading-relaxed mb-8 flex-grow">
                    {post.excerpt || 'Read more about this topic...'}
                  </p>
                  <Link 
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center text-sm uppercase tracking-widest font-medium text-white group-hover:text-[#d4af37] transition-colors mt-auto"
                  >
                    Read Article
                    <div className="w-8 h-[1px] bg-white/20 group-hover:bg-[#d4af37] ml-4 transition-all duration-300" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
