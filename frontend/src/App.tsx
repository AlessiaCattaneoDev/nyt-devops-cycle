import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import SectionPage from './pages/SectionPage'
import ArticleDetail from './pages/ArticleDetail'
import NotFound from './pages/NotFound'
import DebugBoom from './pages/DebugBoom'

const debugEnabled =
  import.meta.env.VITE_APP_ENV !== 'production' || import.meta.env.VITE_DEBUG_ENDPOINTS === 'true'

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="section/:sectionName" element={<SectionPage />} />
            <Route path="article/:id" element={<ArticleDetail />} />
            <Route path="404" element={<NotFound />} />
            {debugEnabled && <Route path="debug/boom" element={<DebugBoom />} />}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}
