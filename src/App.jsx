import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Cotacoes from './pages/Cotacoes'
import NovaCotacao from './pages/NovaCotacao'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<NovaCotacao />} />
        <Route path="cotacoes" element={<Cotacoes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
