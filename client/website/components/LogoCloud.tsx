import { motion } from "framer-motion";

/**
 * Partners & Clients Showcase
 * 
 * To add a new partner:
 * 1. Add logo image to /public/partners/ folder (e.g., company-logo.png)
 * 2. Add entry below with name and logo path
 * 
 * To use placeholder (no logo yet):
 * - Set logo to empty string "" and it will use initials instead
 */
interface Partner {
  name: string;
  logo?: string; // Optional: path to logo image (e.g., "/partners/company-logo.png")
  initials?: string; // Fallback if no logo (e.g., "ABC")
  website?: string; // Optional: partner website URL
}

const partners: Partner[] = [
  { 
    name: "YouTube", 
    initials: "YT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg", // Add logo path here when available
    website: "" 
  },
  { 
    name: "Wealth Management Corp", 
    initials: "WMC",
    logo: "",
    website: "" 
  },
  { 
    name: "Strategic Finance Ltd", 
    initials: "SFL",
    logo: "",
    website: "" 
  },
  { 
    name: "Capital Growth Associates", 
    initials: "CGA",
    logo: "",
    website: "" 
  },
  { 
    name: "Elite Portfolio Services", 
    initials: "EPS",
    logo: "",
    website: "" 
  },
  { 
    name: "Premium Asset Holdings", 
    initials: "PAH",
    logo: "",
    website: "" 
  },
];

const PartnerCard = ({ partner }: { partner: Partner }) => {
  const CardWrapper = partner.website ? motion.a : motion.div;
  const cardProps = partner.website 
    ? { href: partner.website, target: "_blank", rel: "noopener noreferrer" } 
    : {};

  return (
    <CardWrapper
      {...cardProps}
      whileHover={{ scale: 1.05, borderColor: "rgb(186, 127, 50)" }}
      className="flex-shrink-0 w-40 h-40 bg-white rounded-xl shadow-md flex items-center justify-center border-2 border-royal-gold/20 transition-shadow duration-300 cursor-pointer"
    >
      <div className="text-center p-4">
        {partner.logo ? (
          <img 
            src={partner.logo} 
            alt={partner.name}
            className="w-full h-20 object-contain mb-2"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-gold to-royal-copper flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">
              {partner.initials}
            </span>
          </div>
        )}
        <p className="text-xs font-semibold text-royal-black line-clamp-2">
          {partner.name}
        </p>
      </div>
    </CardWrapper>
  );
};

export default function LogoCloud() {
  return (
    <section className="py-16 md:py-24 bg-royal-container overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-royal-black mb-12">
          Our Trusted Partners
        </h2>

        {/* Infinite scroll container */}
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-8 pb-4"
            animate={{
              x: [0, -100 * partners.length - 8 * partners.length], // Move by total width of all partners + gaps
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {/* First set */}
            {partners.map((partner, idx) => (
              <PartnerCard key={`partner-1-${idx}`} partner={partner} />
            ))}
            {/* Duplicate for seamless loop */}
            {partners.map((partner, idx) => (
              <PartnerCard key={`partner-2-${idx}`} partner={partner} />
            ))}
            {/* Triple for extra smoothness */}
            {partners.map((partner, idx) => (
              <PartnerCard key={`partner-3-${idx}`} partner={partner} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
