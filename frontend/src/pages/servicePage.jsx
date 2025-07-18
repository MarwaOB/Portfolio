import React, { useEffect, useState } from 'react';
import ServiceCard from '../components/serviceCard';

const ServicesPage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/services')
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error('Failed to fetch services:', err));
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="w-[90%] mx-auto">
        <h1
  className="text-3xl md:text-5xl font-bold text-[#D8973C] mb-10 text-start"
  style={{ fontFamily: "'Orbitron', sans-serif" }}
>
  Our Services
</h1>

        <div className="flex flex-wrap justify-between gap-y-8 bg-[#273E47] p-8 md:p-12 rounded-xl">
          {services.map((service, index) => {
            const isLast = index === services.length - 1;
            const shouldCenterLast = services.length % 2 === 1 && isLast;

            return (
              <div
                key={service.service_id}
                className={`
                  w-full md:w-[48%]
                  ${shouldCenterLast ? 'mx-auto' : ''}
                `}
              >
                <ServiceCard
                  title={service.title}
                  description={service.description}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
