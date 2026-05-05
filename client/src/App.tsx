import { Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { InventoryPage } from '@/pages/InventoryPage'
import { VehicleDetailPage } from '@/pages/VehicleDetailPage'
import { Toaster } from '@/components/ui/toaster'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<InventoryPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}
