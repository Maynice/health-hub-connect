import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import BookAppointment from "./pages/BookAppointment";
import MedicineShop from "./pages/MedicineShop";
import MedicineReminders from "./pages/MedicineReminders";
import DoctorAppointments from "./pages/DoctorAppointments";
import PatientRecords from "./pages/PatientRecords";
import ManageUsers from "./pages/ManageUsers";
import PharmacyInventory from "./pages/PharmacyInventory";
import HospitalResources from "./pages/HospitalResources";
import Analytics from "./pages/Analytics";
import Prescriptions from "./pages/Prescriptions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/medicine-shop" element={<MedicineShop />} />
            <Route path="/medicine-reminders" element={<MedicineReminders />} />
            <Route path="/doctor-appointments" element={<DoctorAppointments />} />
            <Route path="/patient-records" element={<PatientRecords />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/pharmacy-inventory" element={<PharmacyInventory />} />
            <Route path="/hospital-resources" element={<HospitalResources />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
