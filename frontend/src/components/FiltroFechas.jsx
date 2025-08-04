import React from 'react';
import { useEffect, useState } from "react";
import axios from "axios";

const FiltroFechas = ({ fechaInicio, fechaFin, setFechaInicio, setFechaFin, onBuscar }) => {
  return (
    <div className="flex gap-4 items-end mb-4">
      <div>
        <label>Fecha inicio:</label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="border p-1"
        />
      </div>
      <div>
        <label>Fecha fin:</label>
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="border p-1"
        />
      </div>
      <button
        onClick={onBuscar}
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        Buscar
      </button>
    </div>
  );
};

export default FiltroFechas;
