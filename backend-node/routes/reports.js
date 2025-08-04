const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ExcelJS = require('exceljs');
const { authenticateToken } = require('./auth');

// Ruta para obtener datos de usuarios (para mostrar en la tabla)
router.get('/usuarios', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('email rol loginHistory createdAt');
    
    const usuariosFormateados = users.map(user => ({
      _id: user._id,
      email: user.email,
      rol: user.rol,
      createdAt: new Date(user.createdAt).toLocaleDateString(),
      ultimoAcceso: user.loginHistory.length > 0 
        ? new Date(user.loginHistory[user.loginHistory.length - 1].loginAt).toLocaleDateString()
        : 'Nunca',
      loginCount: user.loginHistory.length
    }));
    
    res.json(usuariosFormateados);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Ruta para exportar a Excel
router.get('/usuarios-excel', authenticateToken, async (req, res) => {
  try {
    // Obtener usuarios con su historial de logins
    const users = await User.find().select('email rol loginHistory createdAt');
    
    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios y Logins');
    
    // Configurar columnas principales
    worksheet.columns = [
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Rol', key: 'rol', width: 20 },
      { header: 'Fecha Registro', key: 'createdAt', width: 20 },
      { header: 'Último Login', key: 'lastLogin', width: 20 },
      { header: 'Total Logins', key: 'loginCount', width: 15 }
    ];
    
    // Formatear fechas para Excel
    const formatDate = (date) => {
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // Agregar datos principales
    users.forEach(user => {
      worksheet.addRow({
        email: user.email,
        rol: user.rol,
        createdAt: formatDate(user.createdAt),
        lastLogin: user.loginHistory.length > 0 
          ? formatDate(user.loginHistory[user.loginHistory.length - 1].loginAt)
          : 'Nunca',
        loginCount: user.loginHistory.length
      });
    });
    
    // Hoja adicional con detalle de logins (opcional)
    if (users.some(user => user.loginHistory.length > 0)) {
      const detailSheet = workbook.addWorksheet('Detalle Logins');
      detailSheet.columns = [
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Fecha Login', key: 'loginAt', width: 25 },
        { header: 'Dirección IP', key: 'ipAddress', width: 20 },
        { header: 'Dispositivo', key: 'userAgent', width: 40 }
      ];
      
      users.forEach(user => {
        user.loginHistory.forEach(login => {
          detailSheet.addRow({
            email: user.email,
            loginAt: formatDate(login.loginAt),
            ipAddress: login.ipAddress || 'Desconocida',
            userAgent: login.userAgent || 'Desconocido'
          });
        });
      });
    }
    
    // Configurar estilos para las cabeceras
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Configurar respuesta
    res.setHeader('Content-Type', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 
      'attachment; filename=reporte-usuarios-logins.xlsx');
    
    // Enviar archivo
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});

module.exports = router;