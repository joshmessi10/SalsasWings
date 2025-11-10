# Salsas Wings Admin App - Setup Guide

## ✅ Project Created Successfully!

Your React admin application for Salsas Wings has been fully set up with a minimalist design using red and white colors.

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── Pages/
│   │   ├── Landing/
│   │   │   ├── Landing.jsx (Order list & time control)
│   │   │   └── Landing.module.css
│   │   ├── Configuracion/
│   │   │   ├── Configuracion.jsx (Manage menu items)
│   │   │   └── Configuracion.module.css
│   │   ├── Gestion/
│   │   │   ├── Gestion.jsx (Expenses & inventory)
│   │   │   └── Gestion.module.css
│   │   ├── PedidosManuales/
│   │   │   ├── PedidosManuales.jsx (Manual order form)
│   │   │   └── PedidosManuales.module.css
│   │   └── Estadisticas/
│   │       ├── Estadisticas.jsx (Analytics & charts)
│   │       └── Estadisticas.module.css
│   ├── layouts/
│   │   ├── MainLayout.jsx (Sidebar navigation)
│   │   └── MainLayout.module.css
│   ├── styles/
│   │   ├── globals.css (Global styles)
│   │   ├── variables.css (CSS variables & theme)
│   │   └── App.css
│   ├── App.jsx (Main routing)
│   └── main.jsx (Entry point)
```

## 🎨 Design Features

### Color Palette
- **Primary Red**: #dc2626
- **Dark Red**: #991b1b
- **Light Red**: #fee2e2
- **White**: #ffffff
- **Grays**: Multiple shades for contrast

### Components
- **Sidebar Navigation**: Collapsible menu with active state indicators
- **Tables**: With hover effects and status badges
- **Forms**: Input fields with red focus states
- **Cards**: Clean white cards with red accents
- **Charts**: Simple bar charts and product lists

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd /Users/qwerty3/Documents/Karosh/SalsasWings/frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser

### 3. Build for Production
```bash
npm run build
```

## 📝 Pages Overview

### Landing (📊)
- Dashboard with order statistics
- Current orders table with status tracking
- Real-time order management

### Configuración (⚙️)
- Add/remove chicken wing types (Alitas)
- Manage sauce options (Salsas)
- Configure side dishes (Papas)

### Gestión (📋)
- **Expenses**: Track and record daily costs
- **Inventory**: Daily inventory check with status levels
  - Green: Well stocked
  - Yellow: Low stock
  - Red: Critical

### Pedidos Manuales (📝)
- Register phone orders
- Record counter orders
- Track order amounts
- Delete/manage manual orders

### Estadísticas (📈)
- Revenue dashboard
- Daily sales chart
- Top-selling products
- Monthly comparison summary
- Performance metrics

## 🔧 Technologies Used

- **React**: UI framework
- **React Router**: Client-side routing
- **CSS Modules**: Scoped styling
- **Vite**: Modern build tool
- **CSS Variables**: Theme customization

## 📱 Responsive Design

The app is fully responsive:
- **Desktop**: Full sidebar with all navigation labels
- **Tablet**: Optimized layout
- **Mobile**: Collapsible sidebar to save space

## 🎯 Features Implemented

✅ Minimalist, clean design
✅ Red and white color scheme
✅ Sidebar navigation with collapsible menu
✅ Order management system
✅ Inventory tracking
✅ Financial management
✅ Analytics dashboard
✅ Menu configuration
✅ Responsive layout
✅ Status indicators and badges
✅ Forms with validation
✅ Data tables with sorting

## 📦 Dependencies

- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^7.1.7
- vite: ^7.2.2

## 🔐 Next Steps

1. **Connect Backend**: Update API endpoints in each page component
2. **Add Authentication**: Implement login/logout functionality
3. **Database Integration**: Connect to your backend database
4. **Real-time Updates**: Add WebSockets for live order updates
5. **Mobile App**: Convert to React Native or similar

## 💡 Tips

- Use CSS variables in `variables.css` for consistent styling
- Each page component is independent and reusable
- MainLayout handles navigation globally
- Modify `globals.css` to change theme-wide styling
- All data is currently mock data - connect to backend APIs

## 📧 Support

For questions about the structure or implementation, review the individual component files which include inline comments.

---

**Created**: November 2024
**Project**: Salsas Wings Admin Dashboard
**Branch**: WEB_APP
