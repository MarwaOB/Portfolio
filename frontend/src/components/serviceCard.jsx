import React from 'react';

const ServiceCard = ({ title, description, className }) => {
  return (
    <div
      className={`
        bg-[#273E47] 
        text-white 
        border 
        border-[#D8973C]
        border-2 
        shadow-lg 
        p-8 
        rounded-lg 
        transition-all 
        duration-300 
        hover:bg-[#EFE9D7] 
        hover:border-[#273E47]
        hover:text-black 
        hover:scale-105 
        ${className}
      `}
    >
      <h3 className="text-2xl font-semibold mb-4 text-[#D8973C] transition-colors duration-300 hover:text-[#273E47]">
        {title}
      </h3>
      <p className="text-base leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default ServiceCard;
