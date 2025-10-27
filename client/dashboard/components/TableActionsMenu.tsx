import { useState, useRef, useEffect } from "react";

export interface TableAction {
  label: string;
  icon?: string;
  color?: "default" | "danger" | "warning";
  onClick: () => void;
}

interface TableActionsMenuProps {
  actions: TableAction[];
}

export default function TableActionsMenu({ actions }: TableActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getActionColor = (color?: string) => {
    switch (color) {
      case "danger":
        return "text-red-600 hover:bg-red-50";
      case "warning":
        return "text-orange-600 hover:bg-orange-50";
      default:
        return "text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
        title="Actions"
      >
        <span className="text-lg">⋯</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm font-medium flex items-center gap-2 transition-all duration-200 ${getActionColor(
                action.color
              )}`}
            >
              {action.icon && <span>{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
