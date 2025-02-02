interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }
  
  export function Button({ children, onClick, disabled }: ButtonProps) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="bg-orange-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
      >
        {children}
      </button>
    );
  }
  