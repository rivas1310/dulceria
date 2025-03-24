"use client";

import SContent from "@/components/products/Scontent";

export default function StatisticsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Panel de Estadísticas</h1>
      <div className="bg-white rounded-lg shadow">
        <SContent />
      </div>
    </div>
  );
}
