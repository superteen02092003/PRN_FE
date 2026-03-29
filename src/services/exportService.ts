import api from './api';

export const exportService = {
  exportOrders: async (params?: any) => {
    const response = await api.get('/export/orders', {
      params,
      responseType: 'blob', // Bắt luồng dữ liệu Binary
    });
    
    // Ép Blob sang Object URL để trigger tải file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Orders_Report.xlsx'); // Tên file tải xuống
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportProducts: async (params?: any) => {
    const response = await api.get('/export/products', {
      params,
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Inventory_Report.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportUsers: async () => {
    const response = await api.get('/export/users', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Users_Report.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
