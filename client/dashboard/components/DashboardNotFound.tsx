import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface DashboardNotFoundProps {
  title: string;
  message: string;
  backButtonText: string;
  backButtonPath: string;
  icon?: string;
}

export default function DashboardNotFound({
  title,
  message,
  backButtonText,
  backButtonPath,
  icon = "🔍",
}: DashboardNotFoundProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-red-50 border-2 border-red-200 rounded-xl p-12 text-center"
    >
      <div className="text-6xl mb-6">{icon}</div>
      <h1 className="text-3xl font-bold text-red-800 mb-3">
        {title}
      </h1>
      <p className="text-red-700 mb-8 text-lg">
        {message}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(backButtonPath)}
        className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {backButtonText}
      </motion.button>
    </motion.div>
  );
}


