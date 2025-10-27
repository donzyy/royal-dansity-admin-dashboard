import { useEffect, useState } from "react";

interface DesktopOnlyGuardProps {
  children: React.ReactNode;
}

export default function DesktopOnlyGuard({ children }: DesktopOnlyGuardProps) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    setIsChecked(true);

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!isChecked) {
    return null;
  }

  if (!isDesktop) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
          backgroundColor: "#fff5f0",
          fontFamily: "sans-serif",
          color: "#b45309",
          padding: "2rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
            ⚠️ Access Restricted
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "500px" }}>
            Due to the complexity and sensitivity of this system, the Admin
            Dashboard can only be accessed from a desktop device.
          </p>
          <p style={{ fontSize: "1rem", marginTop: "1.5rem", color: "#92400e" }}>
            Please switch to a desktop computer and try again.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
