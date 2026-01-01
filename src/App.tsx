import Cursor from './components/Cursor/Cursor'
import NavBar from "./components/NavBar/NavBar";



import Home from './pages/home'
import Projects from './pages/projects'
import About from './pages/about'
import Contact from './pages/contact'


import './App.css'

export default function App() {
  return (
    <>
      <Cursor />
      <NavBar />

      <main>
        <Home />
        <Projects />
        <About />
        <Contact />
      </main>
    </>
  )
}
