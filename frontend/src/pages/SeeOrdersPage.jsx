import React from "react";
import { Link } from "react-router-dom";

function SeeOrdersPage() {
    // Updated dummy orders with title and date
    const orders = Array(15).fill(null).map((_, idx) => ({
        title: `Order1: XXXX YYYYY`,
        date: `2023-10-${(idx + 1).toString().padStart(2, '0')}`,
    }));

    return (
        <div className="h-full flex flex-col overflow-hidden">  
            {/* Orders List with Scroll */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-4 pr-2">
                    {orders.map((order, idx) => (
                        <div
                            key={idx}
                            className="bg-[#BAC3CE] px-4 py-3 rounded flex justify-between items-center"
                        >
                            {/* Title */}
                            <span className="text-black font-medium w-1/3">
                                {order.title} #{idx + 1}
                            </span>

                            {/* Date (centered) */}
                            <span className="text-black font-medium w-1/3 text-center">
                                {order.date}
                            </span>

                            {/* Action Buttons */}
                            <div className="flex gap-2 w-1/3 justify-end">
                                <button className="bg-[#D62828] text-white px-3 py-1 rounded">
                                    Delete
                                </button>
                                <Link to={`/admin/orders/${idx + 1}`}>
                                    <button className="bg-[#E4C900] text-black px-3 py-1 rounded">
                                        More
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SeeOrdersPage;
