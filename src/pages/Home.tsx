import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Scale, 
  Briefcase, 
  Users, 
  Shield, 
  MessageSquare, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  Menu, 
  X,
  Gavel,
  Award,
  FileText,
  Building,
  Handshake
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  createdAt: any;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { staggerChildren: 0.1 }
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('disclaimerAccepted');
    if (!hasAccepted) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setShowDisclaimer(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setRecentPosts(postsData);
      setLoadingPosts(false);
    }, (error) => {
      console.error("Error fetching recent posts:", error);
      setLoadingPosts(false);
    });

    return () => unsubscribe();
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Practice Areas', href: '#practice' },
    { name: 'Experience', href: '#experience' },
    { name: 'Blog', href: '/blog', isRoute: true },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen bg-[#050a30] text-white selection:bg-[#d4af37] selection:text-[#050a30]">
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a1142] border border-[#d4af37]/30 p-8 md:p-12 max-w-3xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-center mb-6 text-[#d4af37]">
              <Scale size={48} />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-center mb-6 text-white">Disclaimer</h2>
            <div className="text-gray-300 text-sm md:text-base leading-relaxed space-y-4 mb-8 text-justify">
              <p>
                The Bar Council of India does not permit advertisement or solicitation by advocates in any form. By accessing this website, you acknowledge that you are seeking information relating to <strong className="text-white">Saswat Kumar Rout</strong> of your own accord, and there has been no form of solicitation, advertisement, or inducement by Saswat Kumar Rout.
              </p>
              <p>
                The content of this website is for <strong className="text-white">informational purposes only</strong> and should not be construed as legal advice. No material or information provided on this website should be relied upon as a substitute for professional legal counsel.
              </p>
              <p>
                All content on this website, including text, images, and design, is the <strong className="text-white">intellectual property of Saswat Kumar Rout</strong> and may not be copied, reproduced, or used without prior permission.
              </p>
            </div>
            <div className="flex justify-center">
              <button 
                onClick={handleAcceptDisclaimer}
                className="bg-[#d4af37] text-[#050a30] px-8 py-3 uppercase tracking-widest text-sm font-bold hover:bg-white transition-colors w-full md:w-auto"
              >
                I Understand & Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#050a30]/90 backdrop-blur-md py-4 shadow-lg shadow-black/20' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link to="/" className="font-serif text-2xl font-bold tracking-wider">
            SKR<span className="text-[#d4af37]">.</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link 
                  key={link.name} 
                  to={link.href}
                  className="text-sm uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a 
                  key={link.name} 
                  href={link.href}
                  className="text-sm uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors"
                >
                  {link.name}
                </a>
              )
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#0a1142] border-t border-white/10 py-4 px-6 flex flex-col space-y-4 shadow-xl">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link 
                  key={link.name} 
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors"
                >
                  {link.name}
                </a>
              )
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full border border-white/10" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full border border-[#d4af37]/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-white/5" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-12 items-center pt-12 md:pt-0">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            <div className="inline-flex items-center space-x-2 mb-6 justify-center md:justify-start w-full">
              <div className="w-8 h-[1px] bg-[#d4af37]" />
              <span className="text-[#d4af37] uppercase tracking-widest text-sm font-medium">Advocate – Orissa High Court</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight mb-6">
              Saswat<br />
              <span className="text-gray-400">Kumar Rout</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-lg mx-auto md:mx-0 font-light leading-relaxed">
              Providing trusted legal representation and professional legal consultation with unwavering commitment to justice.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center md:justify-start">
              <a 
                href="#contact"
                className="px-8 py-4 border border-white/20 hover:border-white transition-colors uppercase tracking-widest text-sm font-medium flex items-center justify-center group"
              >
                Contact Now
                <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full max-w-sm mx-auto md:max-w-none relative h-[400px] md:h-[600px]"
          >
            {/* Lawyer Portrait */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0a1142] to-[#111a5a] rounded-t-full border border-white/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/profile.jpg')] bg-cover bg-top md:bg-center" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#0a1142]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeIn} className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl mb-8">A Legacy of <span className="text-[#d4af37]">Legal Excellence</span></h2>
              <div className="space-y-6 text-gray-300 font-light leading-relaxed">
                <p>
                  I am a practicing lawyer at the Orissa High Court, with expertise in civil, service, family, criminal, commercial, and arbitration matters. I provide comprehensive legal representation before the Orissa High Court, district courts, and tribunals across Odisha, delivering solutions that are strategic, results-oriented, and tailored to each client’s needs.
                </p>
                <p>
                  A graduate of Dr. B. R. Ambedkar National Law University, Sonipat, I combine rigorous academic training with practical experience, leveraging in-depth legal research and strategic advocacy to achieve effective outcomes. Dedicated to upholding justice with integrity and professionalism, I am committed to providing every client with meticulous, thoughtful, and impactful legal support.
                </p>
              </div>
              
              <div className="mt-12">
                <div>
                  <div className="text-[#d4af37] mb-2"><Gavel size={24} /></div>
                  <h4 className="font-medium mb-1">Jurisdiction</h4>
                  <p className="text-sm text-gray-400">Orissa High Court, District Courts, and Specialized Tribunals.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[3/4] bg-[#111a5a] border border-white/10 relative z-10 flex items-center justify-center overflow-hidden">
                 <img 
                  src="/file_00000000a67872098bfee02714bfa0a7.png" 
                  alt="Saswat Kumar Rout" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-full h-full border border-[#d4af37]/30 z-0" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Practice Areas */}
      <section id="practice" className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeIn} className="text-center mb-16">
            <span className="text-[#d4af37] uppercase tracking-widest text-sm font-medium block mb-4">Areas of Expertise</span>
            <h2 className="font-serif text-4xl md:text-5xl">Practice Areas</h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { title: 'Civil Law', icon: <Scale size={32} />, desc: 'Comprehensive representation in civil disputes, contracts, and tort claims.' },
              { title: 'Service Law', icon: <Briefcase size={32} />, desc: 'Expert representation in employment disputes, service matters, and administrative tribunals.' },
              { title: 'Family Disputes', icon: <Users size={32} />, desc: 'Sensitive handling of matrimonial disputes, custody, and alimony cases.' },
              { title: 'Criminal Law', icon: <Shield size={32} />, desc: 'Vigorous defense in criminal proceedings with a focus on protecting constitutional rights.' },
              { title: 'Commercial Law', icon: <Building size={32} />, desc: 'Strategic legal counsel for businesses, corporate governance, and commercial transactions.' },
              { title: 'Arbitration', icon: <Handshake size={32} />, desc: 'Alternative dispute resolution, mediation, and representation in arbitration tribunals.' },
            ].map((area, index) => (
              <motion.div 
                key={index}
                variants={fadeIn}
                className="group bg-[#0a1142] border border-white/5 p-8 hover:border-[#d4af37]/50 transition-colors cursor-pointer"
              >
                <div className="text-gray-500 group-hover:text-[#d4af37] transition-colors mb-6">
                  {area.icon}
                </div>
                <h3 className="text-xl font-serif mb-3">{area.title}</h3>
                <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
                  {area.desc}
                </p>
                <div className="w-8 h-[1px] bg-white/20 group-hover:bg-[#d4af37] group-hover:w-16 transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Experience / Achievements */}
      <section id="experience" className="py-24 bg-[#0a1142]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-3 gap-16">
            <motion.div {...fadeIn} className="lg:col-span-1">
              <span className="text-[#d4af37] uppercase tracking-widest text-sm font-medium block mb-4">Track Record</span>
              <h2 className="font-serif text-4xl md:text-5xl mb-6">Experience & Achievements</h2>
              <p className="text-gray-400 font-light leading-relaxed mb-8">
                A history of securing favorable outcomes in high-stakes litigation and setting legal precedents.
              </p>
              <a href="#contact" className="inline-flex items-center text-[#d4af37] hover:text-white transition-colors uppercase tracking-widest text-sm font-medium">
                Discuss Your Case <ChevronRight size={16} className="ml-2" />
              </a>
            </motion.div>
            
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              className="lg:col-span-2 space-y-8"
            >
              {[
                { title: 'Orissa High Court Litigation Practice', desc: 'Regularly appearing before the Orissa High Court and District Courts across Odisha, handling constitutional, civil, and writ litigation matters while representing individuals and businesses in complex legal disputes.' },
                { title: 'Constitutional & Writ Petitions', desc: 'Filing and arguing writ petitions before the Orissa High Court challenging administrative and quasi-judicial orders, protecting citizens against arbitrary state action and violations of natural justice.' },
                { title: 'Consumer Protection Litigation', desc: 'Represented Sony India Pvt Ltd and Amazon India before consumer dispute redressal forums in Odisha, handling consumer complaints, product liability disputes, and service deficiency claims.' },
                { title: 'Property & Land Disputes', desc: 'Providing legal representation in property disputes, land rights litigation, and illegal demolition matters, securing relief through court intervention against unlawful government actions.' },
                { title: 'Legal Drafting & Advisory', desc: 'Experienced in drafting writ petitions, bail applications, consumer complaints, and civil pleadings, along with preparing legal notices, agreements, and strategic legal advisory.' },
              ].map((item, index) => (
                <motion.div key={index} variants={fadeIn} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border border-[#d4af37] flex items-center justify-center text-[#d4af37] font-serif text-sm">
                      <Award size={20} />
                    </div>
                    {index !== 4 && <div className="w-[1px] h-full bg-white/10 my-2" />}
                  </div>
                  <div className="pb-8">
                    <h4 className="text-xl font-serif mb-2">{item.title}</h4>
                    <p className="text-gray-400 font-light text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog / Insights Section */}
      <section id="blog" className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <motion.div {...fadeIn} className="max-w-2xl">
              <span className="text-[#d4af37] uppercase tracking-widest text-sm font-medium block mb-4">Latest Insights</span>
              <h2 className="font-serif text-4xl md:text-5xl">Legal Blog</h2>
            </motion.div>
            <motion.div {...fadeIn} className="mt-6 md:mt-0">
              <Link to="/blog" className="inline-flex items-center text-[#d4af37] hover:text-white transition-colors uppercase tracking-widest text-sm font-medium">
                View All Posts <ChevronRight size={16} className="ml-2" />
              </Link>
            </motion.div>
          </div>

          {loadingPosts ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-12 border border-white/5 bg-[#0a1142]">
              <p className="text-gray-400 font-light">No posts available at the moment.</p>
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              className="grid md:grid-cols-3 gap-8"
            >
              {recentPosts.map((post, i) => (
                <motion.div 
                  key={post.id}
                  variants={fadeIn}
                  className="group bg-[#0a1142] border border-white/5 hover:border-[#d4af37]/50 transition-colors flex flex-col h-full"
                >
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="text-[#d4af37] text-xs uppercase tracking-widest mb-4">
                      {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : 'Recent'}
                    </div>
                    <h3 className="text-xl font-serif mb-4 group-hover:text-[#d4af37] transition-colors">
                      {post.title}
                    </h3>
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
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-[#0a1142]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fadeIn} className="text-center mb-16">
              <span className="text-[#d4af37] uppercase tracking-widest text-sm font-medium block mb-4">Reach Out</span>
              <h2 className="font-serif text-4xl md:text-5xl">Contact Information</h2>
            </motion.div>
            
            <motion.div {...fadeIn} className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-[#d4af37] mb-2">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-medium uppercase tracking-widest text-sm mb-2">Chambers</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    Cuttack, Odisha<br />
                    India
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-[#d4af37] mb-2">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-medium uppercase tracking-widest text-sm mb-2">Phone</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    +917404212257
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-[#d4af37] mb-2">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-medium uppercase tracking-widest text-sm mb-2">Email</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    advsaswatkumarrout@gmail.com
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020518] pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <Link to="/" className="font-serif text-3xl font-bold tracking-wider block mb-6">
                SKR<span className="text-[#d4af37]">.</span>
              </Link>
              <p className="text-gray-400 font-light leading-relaxed max-w-sm">
                Saswat Kumar Rout is an Advocate at the Orissa High Court, providing expert legal counsel and representation across civil, criminal, and corporate matters.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium uppercase tracking-widest text-sm mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    {link.isRoute ? (
                      <Link to={link.href} className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm">
                        {link.name}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm">
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium uppercase tracking-widest text-sm mb-6 text-white">Practice Areas</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm">Civil Law</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm">Service Law</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm">Family Disputes</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm">Commercial Law</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mb-12 text-xs text-gray-500 leading-relaxed text-justify">
            <p>
              The Bar Council of India does not permit advertisement or solicitation by advocates in any form. By accessing this website, you acknowledge that you are seeking information relating to <strong>Saswat Kumar Rout</strong> of your own accord, and there has been no form of solicitation, advertisement, or inducement by Saswat Kumar Rout. The content of this website is for <strong>informational purposes only</strong> and should not be construed as legal advice. No material or information provided on this website should be relied upon as a substitute for professional legal counsel. All content on this website, including text, images, and design, is the <strong>intellectual property of Saswat Kumar Rout</strong> and may not be copied, reproduced, or used without prior permission.
            </p>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Saswat Kumar Rout. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Disclaimer</a>
              <Link to="/admin" className="hover:text-[#d4af37] transition-colors">Admin Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
