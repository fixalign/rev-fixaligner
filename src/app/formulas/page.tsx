"use client";

import React, { useState } from "react";
import { formatCurrency, formatPercentage } from "@/lib/calculations";

export default function FormulasPage() {
    const [steps, setSteps] = useState(20);
    const [price, setPrice] = useState(1000);

    // Simulation logic based on our engine
    const sheetsQty = steps * 2 + 4;
    const resinQty = (0.8 / 22) * (steps + 2);
    const estimatedHours = steps * 0.15; // 9 minutes per step

    // Defaults (matching our seed data)
    const rates = {
        sheet: 8,
        case: 45,
        resin: 120,
        bag: 0.5,
        box: 15,
        design: 150,
        alcohol: 10,
        tissues: 5,
        tools: 20,
        marketingRate: 7,
        monthlyFixed: 27500, // Updated with 5000 CMO
        capacity: 192,
    };

    const variableCosts = {
        sheets: sheetsQty * rates.sheet,
        case: 1 * rates.case,
        resin: resinQty * rates.resin,
        bag: 1 * rates.bag,
        box: 1 * rates.box,
    };
    const totalVariable = Object.values(variableCosts).reduce((a, b) => a + b, 0);

    const directCosts = {
        design: 1 * rates.design,
        alcohol: rates.alcohol,
        tissues: rates.tissues,
        tools: sheetsQty * 0.6 * rates.tools + 2,
        marketing: price * (rates.marketingRate / 100),
    };
    const totalDirect = Object.values(directCosts).reduce((a, b) => a + b, 0);

    const allocatedOverhead = (rates.monthlyFixed * estimatedHours) / rates.capacity;
    const totalCost = totalVariable + totalDirect + allocatedOverhead;
    const opProfit = price - totalCost;
    const grossProfit = price - (totalVariable + totalDirect);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Calculation Formulas</h1>
                    <p className="text-lg text-gray-600 italic">"The Micro-Economy of a Single Treatment"</p>
                </div>

                {/* Interactive Simulator */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-12 border-2 border-blue-500">
                    <div className="bg-blue-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="mr-2">🧪</span> Live Formula Simulator
                        </h2>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Number of Steps</label>
                                <input
                                    type="range" min="1" max="60" value={steps}
                                    onChange={(e) => setSteps(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                    <span>1 Step</span>
                                    <span className="font-bold text-blue-600 text-lg">{steps} Steps</span>
                                    <span>60 Steps</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Treatment Price ($)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                                    <input
                                        type="number" value={price}
                                        onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Execution Metrics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500">Execution Time</p>
                                        <p className="text-xl font-bold text-gray-900">{estimatedHours.toFixed(2)}h</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500">Resin Needed</p>
                                        <p className="text-xl font-bold text-gray-900">{resinQty.toFixed(2)}L</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-6 text-white shadow-inner">
                            <h3 className="text-blue-400 font-mono text-sm mb-4">{"//"} Financial Results</h3>
                            <div className="space-y-3 font-mono text-sm">
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span>Revenue:</span>
                                    <span className="text-green-400">{formatCurrency(price)}</span>
                                </div>
                                <div className="flex justify-between text-red-300">
                                    <span>Variable Costs:</span>
                                    <span>-{formatCurrency(totalVariable)}</span>
                                </div>
                                <div className="flex justify-between text-red-300">
                                    <span>Direct Costs:</span>
                                    <span>-{formatCurrency(totalDirect)}</span>
                                </div>
                                <div className="flex justify-between text-yellow-300 font-bold border-t border-gray-800 pt-2">
                                    <span>Gross Profit:</span>
                                    <span>{formatCurrency(grossProfit)}</span>
                                </div>
                                <div className="flex justify-between text-red-400">
                                    <span>Overhead Share:</span>
                                    <span>-{formatCurrency(allocatedOverhead)}</span>
                                </div>
                                <div className="flex justify-between text-blue-400 font-bold text-xl border-t-2 border-gray-700 pt-4 mt-2">
                                    <span>Op. Profit:</span>
                                    <span>{formatCurrency(opProfit)}</span>
                                </div>
                                <div className="flex justify-between text-blue-300 text-xs mt-4">
                                    <span>Profit/Hour:</span>
                                    <span>{formatCurrency(opProfit / estimatedHours)}/h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documentation Sections */}
                <div className="space-y-8">
                    {/* Section 1: Variable Costs */}
                    <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="bg-blue-100 p-2 rounded-lg mr-3">📦</span> Variable Costs
                        </h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-bold text-gray-800 mb-1">Sheets Quantity</h3>
                                    <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">Steps × 2 + 4</code>
                                    <p className="text-sm text-gray-500 mt-2">Allocates 2 sheets per step plus a safety margin of 4.</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-bold text-gray-800 mb-1">Resin Volume (L)</h3>
                                    <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">(0.8 / 22) × (Steps + 2)</code>
                                    <p className="text-sm text-gray-500 mt-2">Heuristic based on 0.8L covering 22 aligners on average.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Direct Costs */}
                    <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="bg-green-100 p-2 rounded-lg mr-3">🛠️</span> Direct & Marketing Costs
                        </h2>
                        <div className="space-y-6">
                            <div className="p-4 border-l-4 border-green-500 bg-green-50 mb-6">
                                <h3 className="font-bold text-gray-800 mb-1">Production Tools (3:5 Rule)</h3>
                                <code className="text-green-700 block my-2 font-bold">(Sheets × 0.6) × Head_Rate + $2</code>
                                <p className="text-sm text-gray-600">We consume 3 tools heads for every 5 sheets used, plus a standard $2 maintenance fee.</p>
                            </div>
                            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                                <h3 className="font-bold text-gray-800 mb-1">Marketing Fee</h3>
                                <code className="text-blue-700 block my-2 font-bold">Treatment Price × {rates.marketingRate}%</code>
                                <p className="text-sm text-gray-600">Calculated as a percentage of the final price to represent lead acquisition cost.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Overhead Allocation */}
                    <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="bg-purple-100 p-2 rounded-lg mr-3">🏢</span> Fixed Cost Share (Micro-Economy)
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Instead of dividing total fixed costs by patients, we use an **hours-based burden model**.
                            This shows how much of the company's overhead is "rented" by this specific treatment duration.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-purple-900 text-white p-6 rounded-xl font-mono">
                                <div className="mb-4">
                                    <span className="text-purple-300">1. Execution Time:</span>
                                    <p className="ml-4">Steps × 0.15 hours (9 minutes/step)</p>
                                </div>
                                <div className="mb-4">
                                    <span className="text-purple-300">2. Overhead Share:</span>
                                    <p className="ml-4">(Monthly Fixed Costs × Execution Time) / Monthly Capacity</p>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>ℹ️ Unallocated Burden:</strong> Any portion of the monthly fixed cost not "rented" by a treatment remains
                                    as an enterprise burden, displayed in the unallocated column.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-12 text-center text-gray-400 text-sm">
                    <p>© 2026 Financial Engine v2.0 - Fully Integrated CMOS & Marketing Fees</p>
                </div>
            </div>
        </div>
    );
}
