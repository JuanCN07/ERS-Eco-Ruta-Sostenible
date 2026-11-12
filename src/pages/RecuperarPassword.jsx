import { Link } from 'react-router-dom'
import logoERS from '../assets/logo-ers.png'

function RecuperarPassword() {

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <main className="page-background">
      <section className="mobile-container recovery-screen">

        <div className="brand-container">
          <span className="brand-ers">ERS</span>

          <img
            src={logoERS}
            alt="ERS Eco Ruta Sostenible"
            className="brand-logo"
          />
        </div>

        <p className="recovery-description">
          Plataforma para la gestión de residuos
          aprovechables y su recolección sostenible
        </p>

        <h1 className="recovery-title">
          Para restablecer la contraseña por favor
          ingrese el correo electrónico con el cual se
          registró en el sistema
        </h1>

        <form
          className="ers-form recovery-form"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
          />

          <button
            type="submit"
            className="primary-button"
          >
            Enviar enlace de recuperación
          </button>
        </form>

        <Link
          to="/login"
          className="return-link recovery-return"
        >
          Volver al inicio de sesión
        </Link>

      </section>
    </main>
  )
}

export default RecuperarPassword