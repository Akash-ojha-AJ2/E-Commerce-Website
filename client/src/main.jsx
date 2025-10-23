import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './store/Context'; // ✅ correct import
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper /> {/* ✅ Wrap everything inside AppWrapper */}
    <ToastContainer position="top-right" autoClose={3000} />
  </React.StrictMode>
);
