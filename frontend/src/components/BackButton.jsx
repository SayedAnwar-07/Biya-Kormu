import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BackButton = ({
  variant = "ghost",
  className = "",
  iconClassName = "h-4 w-4",
  text = "Back",
  onClick,
  ...props
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center mb-6">
      <Button
        variant={variant}
        onClick={handleClick}
        className={`flex items-center gap-2 ${className}`}
        {...props}
      >
        <ArrowLeft className={iconClassName} />
        {text}
      </Button>
    </div>
  );
};

export default BackButton;
