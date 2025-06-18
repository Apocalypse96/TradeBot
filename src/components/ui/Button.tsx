import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "font-medium transition-all duration-300 trading-btn hover-lift rounded-lg";

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white neon-blue",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-300",
    danger: "bg-red-600 hover:bg-red-700 text-white neon-red",
    success: "bg-green-600 hover:bg-green-700 text-white neon-green",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-lg",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
