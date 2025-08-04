import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useEffect, useState } from "react";
import axios from "axios";

const BotonExportarExcel = ({ datos }) => {
  const exportarExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const archivo = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(archivo, 'reporte_ventas.xlsx');
  };

  return (
    <button
      onClick={exportarExcel}
      className="mt-4 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
    >
      Exportar a Excel
    </button>
  );
};

export default BotonExportarExcel;
