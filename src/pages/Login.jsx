import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import logoERS from '../assets/logo-ers.png'

function Login() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (!correo || !password) {
      setError('Ingresa tu correo electrónico y contraseña.')
      return
    }

    try {
      setCargando(true)

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: correo,
          password: password
        })

      if (loginError) {
        throw loginError
      }

      const usuario = data.user

      if (!usuario) {
        throw new Error('No fue posible identificar el usuario.')
      }

      const { data: perfil, error: profileError } =
        await supabase
          .from('profiles')
          .select('nombre, tipo_usuario')
          .eq('id', usuario.id)
          .single()

      if (profileError) {
        throw profileError
      }

      if (perfil.tipo_usuario === 'generador') {
        navigate('/generador')
      } else if (perfil.tipo_usuario === 'reciclador') {
        navigate('/reciclador')
      } else {
        setError('El tipo de usuario no es válido.')
      }

    } catch (err) {
      console.error('Error al iniciar sesión:', err)

      if (
        err.message === 'Invalid login credentials'
      ) {
        setError(
          'Correo electrónico o contraseña incorrectos.'
        )
      } else if (
        err.message === 'Email not confirmed'
      ) {
        setError(
          'Debes confirmar tu correo electrónico antes de iniciar sesión.'
        )
      } else {
        setError(
          err.message ||
          'Ocurrió un error al iniciar sesión.'
        )
      }

    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="page-background">
      <section className="mobile-container auth-screen">

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

        <h1 className="login-title">
          Bienvenido
        </h1>

        <form
          className="ers-form login-form"
          onSubmit={handleSubmit}
        >

          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) =>
              setCorreo(e.target.value)
            }
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete="current-password"
          />

          {error && (
            <div className="form-message error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={cargando}
          >
            {cargando
              ? 'Ingresando...'
              : 'Iniciar Sesión'}
          </button>

        </form>

        <Link
          to="/recuperar-password"
          className="forgot-link"
        >
          ¿Olvidaste tu contraseña?
        </Link>

        <p className="auth-bottom-text">
          ¿No tienes una cuenta?{' '}

          <Link to="/registro">
            Regístrate
          </Link>
        </p>

        <Link
          to="/"
          className="return-link"
        >
          Volver al inicio
        </Link>

      </section>
    </main>
  )
}

export default Login