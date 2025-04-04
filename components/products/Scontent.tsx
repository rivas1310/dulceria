"use client";
import { useEffect, useState } from "react";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Image from 'next/image';

// Registrar los componentes necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopProduct {
  id: number;
  name: string;
  image: string;
  totalSold: number;
  stock: number;
  price: number;
  isActive: boolean;
  category: {
    name: string;
  } | null;
}

export default function SContent() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      const response = await fetch('/admin/estadistica/api');
      const data = await response.json();
      setTopProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos Más Vendidos');

    worksheet.columns = [
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Unidades Vendidas', key: 'vendidos', width: 20 },
      { header: 'Stock Actual', key: 'stock', width: 15 },
      { header: 'Precio', key: 'precio', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 }
    ];

    topProducts.forEach(product => {
      worksheet.addRow({
        producto: product.name,
        categoria: product.category?.name || 'Sin categoría',
        vendidos: product.totalSold,
        stock: product.stock,
        precio: `$${product.price}`,
        estado: product.isActive ? 'Activo' : 'Inactivo'
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos-mas-vendidos.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Productos Más Vendidos", 14, 15);
    
    autoTable(doc, {
      head: [['Producto', 'Categoría', 'Unidades Vendidas', 'Stock', 'Precio', 'Estado']],
      body: topProducts.map(product => [
        product.name,
        product.category?.name || 'Sin categoría',
        product.totalSold.toString(),
        product.stock.toString(),
        `$${product.price}`,
        product.isActive ? 'Activo' : 'Inactivo'
      ]),
      startY: 25,
    });

    doc.save("productos-mas-vendidos.pdf");
  };

  // Configuración de la gráfica
  const chartData = {
    labels: topProducts.map(product => product.name),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: topProducts.map(product => product.totalSold),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
      {
        label: 'Stock Actual',
        data: topProducts.map(product => product.stock),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Productos Más Vendidos vs Stock Actual',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6">
      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={downloadExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Descargar Excel
        </button>
        <button
          onClick={downloadPDF}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Descargar PDF
        </button>
      </div>

      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Estadísticas de Productos</h2>
        <div className="h-[400px]">
          {!loading && <Bar data={chartData} options={chartOptions} />}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Productos Más Vendidos</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidades Vendidas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <Image 
                            src={product.image} 
                            alt={`Imagen de ${product.name}`} 
                            width={300} 
                            height={300}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.category?.name || 'Sin categoría'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {product.totalSold}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > 5 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${product.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
