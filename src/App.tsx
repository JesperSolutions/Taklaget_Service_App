import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from "./components/Navbar";
import ReportsList from "./components/ReportsList";
import CreateReport from "./components/CreateReport";
import ReportDetails from "./components/ReportDetails";
import CompanyInfo from "./components/CompanyInfo";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ReportsList />} />
            <Route path="/reports/new" element={<CreateReport />} />
            <Route path="/reports/:id" element={<ReportDetails />} />
            <Route path="/company" element={<CompanyInfo />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;