import React from 'react';

const ServiceCard = ({ title, description, className }) => {
  return (
    <div
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      className={`
        bg-[#273E47] 
        text-white 
        border 
        border-[#D8973C]
        border-2 
        shadow-lg 
        p-6 
        rounded-lg 
        transition-all 
        duration-300 
        hover:bg-[#EFE9D7] 
        hover:border-[#273E47]
        hover:text-black 
        hover:scale-105 
        w-full h-full
        ${className}
      `}
    >
      <h3 className="text-xl md:text-2xl font-semibold mb-3 text-[#D8973C] transition-colors duration-300 hover:text-[#273E47]">
        {title}
      </h3>
      <p className="text-sm md:text-base leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default ServiceCard;
