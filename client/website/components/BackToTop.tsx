import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    // Monitor scroll position to toggle visibility
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll smoothly to the top when clicked
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onClick={scrollToTop}
                    className="back-to-top fixed bottom-8 right-8 z-[999] h-12 w-12 flex items-center justify-center rounded-full bg-royal-purple text-white shadow-lg hover:bg-royal-gold hover:shadow-xl"
                    aria-label="Back to top"
                >
                    <span className="mt-[6px] h-3 w-3 rotate-45 border-t-2 border-l-2 border-white"></span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}

export default BackToTop;
