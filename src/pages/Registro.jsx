import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import logoERS from '../assets/logo-ers.png'

function Registro() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [direccion, setDireccion] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setMensaje('')

    // Validar campos
    if (
      !nombre ||
      !correo ||
      !direccion ||
      !municipio ||
      !tipoUsuario ||
      !password ||
      !confirmarPassword
    ) {
      setError('Por favor completa todos los campos.')
      return
    }

    // Validar contraseñas
    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    // Recomendación mínima propia para ERS
    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.')
      return
    }

    try {
      setCargando(true)

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: correo,
          password: password,

          options: {
            data: {
              nombre: nombre,
              direccion: direccion,
              municipio: municipio,
              tipo_usuario: tipoUsuario
            }
          }
        })

      if (signUpError) {
        throw signUpError
      }

      console.log('Usuario creado:', data)

      /*
        Si Supabase tiene activada la confirmación por correo,
        data.session será null hasta que el usuario confirme.
      */

      if (!data.session) {
        setMensaje(
          'Cuenta creada correctamente. Revisa tu correo electrónico para confirmar tu cuenta.'
        )
      } else {
        setMensaje(
          'Cuenta creada correctamente. Ya puedes iniciar sesión.'
        )
      }

      // Limpiar formulario
      setNombre('')
      setCorreo('')
      setDireccion('')
      setMunicipio('')
      setTipoUsuario('')
      setPassword('')
      setConfirmarPassword('')

    } catch (err) {
      console.error('Error al registrar:', err)

      setError(
        err.message ||
        'Ocurrió un error al crear la cuenta.'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="page-background">
      <section className="mobile-container auth-screen register-screen">

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

        <div className="register-heading">
          <h1>
            Crea una cuenta
          </h1>

          <p>
            Ingresa tus datos
            <br />
            para registrarte en esta aplicación
          </p>
        </div>

        <form
          className="ers-form"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) =>
              setCorreo(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) =>
              setDireccion(e.target.value)
            }
          />

          <select
            value={municipio}
            onChange={(e) =>
              setMunicipio(e.target.value)
            }
          >
            <option value="">
              Municipio
            </option>

            <option value="Palmira">
              Palmira
            </option>

            <option value="Cali">
              Cali
            </option>

            <option value="Tuluá">
              Tuluá
            </option>

            <option value="Guadalajara de Buga">
              Guadalajara de Buga
            </option>

            <option value="Yumbo">
              Yumbo
            </option>

            <option value="Otro">
              Otro municipio
            </option>
          </select>

          <select
            value={tipoUsuario}
            onChange={(e) =>
              setTipoUsuario(e.target.value)
            }
          >
            <option value="">
              Tipo de usuario
            </option>

            <option value="generador">
              Generador
            </option>

            <option value="reciclador">
              Reciclador
            </option>
          </select>

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmarPassword}
            onChange={(e) =>
              setConfirmarPassword(e.target.value)
            }
          />

          {error && (
            <div className="form-message error-message">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="form-message success-message">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={cargando}
          >
            {cargando
              ? 'Creando cuenta...'
              : 'Finalizar'}
          </button>

          <button
            type="button"
            className="google-button"
          >
            <span className="google-g">
              G
            </span>

            Continuar con Google
          </button>

        </form>

        <p className="auth-bottom-text">
          ¿Ya tienes una cuenta?{' '}

          <Link to="/login">
            Inicia sesión
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

export default Registro