import Navbar from '../components/Navbar/Navbar'
import './Home.css'

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="home">
        <section className="hero">
          <div className="hero-left">
            <p className="eyebrow">Software & Firmware Engineer</p>

            <h1>
              Christian Silva
            </h1>

            <p className="subtitle">
              Building software, firmware and interactive experiences.
            </p>
          </div>

          <div className="hero-right">
            {/* Robô / Visual entra aqui depois */}
          </div>
        </section>
      </main>
    </>
  )
}
