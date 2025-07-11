import React, { useState } from "react";
import { User, Mail, Phone, Building, Calendar, DollarSign, Code, FileText, Target, Clock, CreditCard, Wallet, Banknote, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";


function OrderDetails() {
    const [activeButton, setActiveButton] = useState("see");

    // Dummy client order data
    const order = {
        id: 1,
        client: {
            nom: "Doe",
            prenom: "John",
            email: "john.doe@example.com",
            telephone: "+213 123 456 789",
            situation: "Entreprise", // Options: Entreprise, Particulier, Startup, Association, Autre
        },
        title: "E-Commerce Website",
        description: "Je souhaite créer une plateforme e-commerce avec gestion de produits, paiement sécurisé, tableau de bord admin, etc.",
        budget_min: 2000,
        budget_max: 5000,
        period: {
            from: "2024-09-01",
            to: "2024-12-01",
        },
        technologies: ["React.js", "Node.js", "MongoDB", "Tailwind CSS"],
        date: "2024-08-15",
                paymentMethods: ["Credit Card", "Bank Transfer", "PayPal", "Cash", "Mobile Payment"]

    };

    const getSituationIcon = (situation) => {
        switch(situation) {
            case "Entreprise": return <Building className="w-4 h-4" />;
            case "Startup": return <Target className="w-4 h-4" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    const getSituationColor = (situation) => {
        switch(situation) {
            case "Entreprise": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Startup": return "bg-purple-100 text-purple-800 border-purple-200";
            case "Particulier": return "bg-green-100 text-green-800 border-green-200";
            case "Association": return "bg-orange-100 text-orange-800 border-orange-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getTechColor = (tech) => {
        const colors = [
            "bg-indigo-100 text-indigo-800 border-indigo-200",
            "bg-emerald-100 text-emerald-800 border-emerald-200",
            "bg-amber-100 text-amber-800 border-amber-200",
            "bg-rose-100 text-rose-800 border-rose-200",
            "bg-cyan-100 text-cyan-800 border-cyan-200",
        ];
        return colors[Math.abs(tech.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];
    };

    const getPaymentIcon = (method) => {
        switch(method) {
            case "Credit Card": return <CreditCard className="w-4 h-4" />;
            case "Bank Transfer": return <Banknote className="w-4 h-4" />;
            case "PayPal": return <Wallet className="w-4 h-4" />;
            case "Cash": return <DollarSign className="w-4 h-4" />;
            case "Mobile Payment": return <Smartphone className="w-4 h-4" />;
            default: return <CreditCard className="w-4 h-4" />;
        }
    };

    const getPaymentColor = (method) => {
        switch(method) {
            case "Credit Card": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Bank Transfer": return "bg-green-100 text-green-800 border-green-200";
            case "PayPal": return "bg-indigo-100 text-indigo-800 border-indigo-200";
            case "Cash": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Mobile Payment": return "bg-purple-100 text-purple-800 border-purple-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden ">
            {/* Navigation Button */}
            <div className="mb-8 flex">
                                <Link to="/admin/orders/see" className="relative z-10">
                <button
                    className={`border border-black px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105
                        ${activeButton === "see"
                            ? "bg-[#2D2A26] text-white shadow-xl"
                            : "bg-white text-[#2D2A26] shadow-lg hover:shadow-xl"}
                    `}
                    onClick={() => setActiveButton("see")}
                >
                    ← Back to Orders
                </button>
                </Link>
            </div>

            {/* Order Details */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header Card */}
                    <div className=" bg-[#E8ECF4] rounded-2xl shadow-xl p-8 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-[#2D2A26] mb-2">{order.title}</h1>
                                <p className="text-gray-600 text-lg">Order #{order.id}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-[#2D2A26]">
                                                {order.date} 
                                </div>
                                <p className="text-gray-500">Order Date</p>
                            </div>
                        </div>
                    </div>

                    {/* Client Info Card */}
                    <div className="bg-[#E8ECF4] rounded-2xl shadow-xl p-8 border border-gray-200">
                        <div className="flex items-center mb-6">
                            <div className="bg-blue-100 p-3 rounded-full mr-4">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#2D2A26]">Client Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                <User className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="font-semibold text-gray-900">{order.client.prenom} {order.client.nom}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                <Mail className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-semibold text-gray-900">{order.client.email}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                <Phone className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-semibold text-gray-900">{order.client.telephone}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                {getSituationIcon(order.client.situation)}
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <span className={`inline-flex items-center px-3 py-0 rounded-full text-sm font-medium border ${getSituationColor(order.client.situation)}`}>
                                        {order.client.situation}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-[#E8ECF4] rounded-2xl shadow-xl p-8 border border-gray-200">
                        <div className="flex items-center mb-6">
                            <div className="bg-green-100 p-3 rounded-full mr-4">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#2D2A26]">Project Description</h2>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                            <p className="text-gray-700 leading-relaxed text-lg">
                                {order.description}
                            </p>
                        </div>
                    </div>

                    {/* Budget & Timeline Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Budget Card */}
                        <div className="bg-[#E8ECF4] rounded-2xl shadow-xl p-8 border border-gray-200">
                            <div className="flex items-center mb-6">
                                <div className="bg-green-100 p-3 rounded-full mr-4">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-[#2D2A26]">Budget</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                                    <span className="text-gray-600">Minimum</span>
                                    <span className="text-2xl font-bold text-green-600">{order.budget_min} DA</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                                    <span className="text-gray-600">Maximum</span>
                                    <span className="text-2xl font-bold text-green-600">{order.budget_max} DA</span>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Card */}
                        <div className="bg-[#E8ECF4]  rounded-2xl shadow-xl p-8 border border-gray-200">
                            <div className="flex items-center mb-6">
                                <div className="bg-purple-100 p-3 rounded-full mr-4">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-bold text-[#2D2A26]">Timeline</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Start Date</p>
                                        <p className="font-semibold text-gray-900">{order.period.from}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">End Date</p>
                                        <p className="font-semibold text-gray-900">{order.period.to}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


{/* Payment Methods Card */}
                    <div className="bg-[#E8ECF4] backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
                        <div className="flex items-center mb-6">
                            <div className="bg-teal-100 p-3 rounded-full mr-4">
                                <CreditCard className="w-6 h-6 text-teal-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#2D2A26]">Payment Methods</h2>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            {order.paymentMethods.map((method, idx) => (
                                <span
                                    key={idx}
                                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 hover:scale-105 ${getPaymentColor(method)}`}
                                >
                                    {getPaymentIcon(method)}
                                    <span className="ml-2">{method}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Technologies Card */}
                    <div className="bg-[#E8ECF4]  rounded-2xl shadow-xl p-8 border border-gray-200">
                        <div className="flex items-center mb-6">
                            <div className="bg-indigo-100 p-3 rounded-full mr-4">
                                <Code className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#2D2A26]">Required Technologies</h2>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            {order.technologies.map((tech, idx) => (
                                <span
                                    key={idx}
                                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 hover:scale-105 ${getTechColor(tech)}`}
                                >
                                    <Code className="w-4 h-4 mr-2" />
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-[#E8ECF4]  rounded-2xl shadow-xl p-8 border border-gray-200">
                        <div className="flex justify-end space-x-4">
                            <button
                                className="bg-red-500 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
                            >
                                Delete
                            </button>
                           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetails;