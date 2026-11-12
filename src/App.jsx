import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom'

import logoERS from './assets/logo-ers.png'

import Login from './pages/Login'
import Registro from './pages/Registro'
import RecuperarPassword from './pages/RecuperarPassword'

import PanelGenerador from './pages/PanelGenerador'
import PanelReciclador from './pages/PanelReciclador'
import NuevaRecoleccion from './pages/NuevaRecoleccion'

import RutaProtegida from './components/RutaProtegida'

import './App.css'


// ==========================================
// PÁGINA DE INICIO
// ==========================================

function Inicio() {

  return (

    <main className="page-background">

      <section className="mobile-container home-screen">


        <h1 className="home-title">
          Bienvenidos
        </h1>


        <p className="home-description">

          Plataforma para la gestión de residuos
          aprovechables y su recolección sostenible

        </p>


        <div className="home-ers">
          ERS
        </div>


        <img
          src={logoERS}
          alt="ERS Eco Ruta Sostenible"
          className="home-logo"
        />


        <div className="home-actions">

          <Link to="/login">

            <button
              type="button"
              className="primary-button"
            >
              Iniciar Sesión
            </button>

          </Link>


          <Link to="/registro">

            <button
              type="button"
              className="primary-button"
            >
              Registrarse
            </button>

          </Link>

        </div>


        <p className="terms-text">

          Haz clic aquí para consultar los{' '}

          <Link to="/terminos">
            Términos y condiciones de uso
          </Link>

        </p>


      </section>

    </main>

  )

}


// ==========================================
// TÉRMINOS Y CONDICIONES
// ==========================================

function Terminos() {

  return (

    <main className="page-background">

      <section className="mobile-container terms-screen">


        <div className="brand-container">

          <span className="brand-ers">
            ERS
          </span>


          <img
            src={logoERS}
            alt="ERS Eco Ruta Sostenible"
            className="brand-logo"
          />

        </div>


        <div className="terms-document">


          <h1>
            Términos y Condiciones de Uso – Plataforma ERS
          </h1>


          <p className="terms-date">
            Última actualización: Octubre de 2026
          </p>


          <p>

            Los presentes Términos y Condiciones regulan
            el acceso y uso de la plataforma ERS - Eco
            Ruta Sostenible (en adelante, "la Plataforma"),
            diseñada para facilitar la gestión, comunicación
            y coordinación de la recolección de residuos
            sólidos aprovechables entre ciudadanos,
            establecimientos comerciales y recicladores
            de oficio.

          </p>


          <h2>
            1. Aceptación de los Términos
          </h2>


          <p>

            Al crear una cuenta o utilizar los servicios
            de ERS, el usuario acepta de manera íntegra y
            sin reservas los presentes términos. Si el
            usuario no está de acuerdo con alguna de las
            cláusulas, deberá abstenerse de utilizar la
            Plataforma.

          </p>


          <h2>
            2. Descripción del Servicio
          </h2>


          <p>
            ERS proporciona herramientas digitales para:
          </p>


          <ul>

            <li>

              Registro y publicación de materiales
              aprovechables disponibles (cartón, plástico,
              vidrio, metales, entre otros).

            </li>


            <li>

              Geolocalización de las solicitudes para
              conectar a los generadores con los
              recicladores cercanos.

            </li>


            <li>

              Gestión y seguimiento del estado de las
              solicitudes de recolección.

            </li>


            <li>

              Acceso a información básica, estadísticas
              de recolección y guías sobre la correcta
              separación en la fuente.

            </li>

          </ul>


        </div>


        <Link
          to="/"
          className="simple-link"
        >
          Volver al inicio
        </Link>


      </section>

    </main>

  )

}


// ==========================================
// APLICACIÓN
// ==========================================

function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* =====================================
            RUTAS PÚBLICAS
        ====================================== */}

        <Route
          path="/"
          element={<Inicio />}
        />


        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/registro"
          element={<Registro />}
        />


        <Route
          path="/terminos"
          element={<Terminos />}
        />


        <Route
          path="/recuperar-password"
          element={<RecuperarPassword />}
        />


        {/* =====================================
            RUTAS DEL GENERADOR
        ====================================== */}

        <Route
          path="/generador"
          element={

            <RutaProtegida
              rolPermitido="generador"
            >

              <PanelGenerador />

            </RutaProtegida>

          }
        />


        <Route
          path="/nueva-recoleccion"
          element={

            <RutaProtegida
              rolPermitido="generador"
            >

              <NuevaRecoleccion />

            </RutaProtegida>

          }
        />


        {/* =====================================
            RUTAS DEL RECICLADOR
        ====================================== */}

        <Route
          path="/reciclador"
          element={

            <RutaProtegida
              rolPermitido="reciclador"
            >

              <PanelReciclador />

            </RutaProtegida>

          }
        />


      </Routes>

    </BrowserRouter>

  )

}


export default App