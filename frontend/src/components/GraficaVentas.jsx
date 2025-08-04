import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from "react";
import axios from "axios";

const GraficaVentas = ({ datos }) => {
  if (!datos || datos.length === 0) return null;

  // Ejemplo: agrupar por fecha y sumar totales
  const agrupado = datos.reduce((acc, venta) => {
    const fecha = venta.fecha || 'Sin fecha';
    const total = parseFloat(venta.total || 0);
    acc[fecha] = (acc[fecha] || 0) + total;
    return acc;
  }, {});

  const data = Object.entries(agrupado).map(([fecha, total]) => ({ fecha, total }));

  return (
    <div className="mt-6 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#3182ce" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficaVentas;
