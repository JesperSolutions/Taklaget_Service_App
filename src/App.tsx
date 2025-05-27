import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ReportsList from './components/ReportsList';
import CreateReport from './components/CreateReport';
import ReportDetails from './components/ReportDetails';
import CompanyInfo from './components/CompanyInfo';
import Login from './components/Login';
import Register from './components/Register';
import ErrorBoundary from './components/ErrorBoundary';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                      <Routes>
                        <Route index element={<ReportsList />} />
                        <Route path="reports/new" element={<CreateReport />} />
                        <Route path="reports/:id" element={<ReportDetails />} />
                        <Route path="company" element={<CompanyInfo />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </>
                </PrivateRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;