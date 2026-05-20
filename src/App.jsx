import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthModal from './components/AuthModal'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Insights from './pages/Insights'
import ArticleDetail from './pages/ArticleDetail'
import Partners from './pages/Partners'
import Properties from './pages/Properties'
import BuilderProperties from './pages/BuilderProperties'
import PropertyDetail from './pages/PropertyDetail'
import SavedProperties from './pages/SavedProperties'
import ResetPassword from './pages/ResetPassword'

// Global modal renderer — renders on every page
function GlobalAuthModal() {
  const { authModal, closeAuth } = useAuth()
  if (!authModal) return null
  return (
    <AuthModal
      defaultView={authModal.view}
      onClose={closeAuth}
      onSuccess={authModal.onSuccess}
    />
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <GlobalAuthModal />
        <Routes>
          <Route path="/"                        element={<Home />} />
          <Route path="/contact"                 element={<Contact />} />
          <Route path="/insights"                element={<Insights />} />
          <Route path="/insights/:slug"          element={<ArticleDetail />} />
          <Route path="/partners"                element={<Partners />} />
          <Route path="/partners/:builderId"     element={<BuilderProperties />} />
          <Route path="/properties"              element={<Properties />} />
          <Route path="/properties/:id"          element={<PropertyDetail />} />
          <Route path="/saved"                   element={<SavedProperties />} />
          <Route path="/reset-password"          element={<ResetPassword />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App