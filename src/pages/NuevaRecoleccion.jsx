import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'

import logoERS from '../assets/logo-ers.png'
import iconoUsuario from '../assets/icono-usuario.png'

function NuevaRecoleccion() {

  const navigate = useNavigate()

  const [material, setMaterial] = useState('')
  const [otroMaterial, setOtroMaterial] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [direccion, setDireccion] = useState('')

  const [latitud, setLatitud] = useState(null)
  const [longitud, setLongitud] = useState(null)

  const [mensajeUbicacion, setMensajeUbicacion] =
    useState('')

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const obtenerUbicacion = () => {

    setMensajeUbicacion('')
    setError('')

    if (!navigator.geolocation) {
      setError(
        'Tu dispositivo no permite obtener la ubicación.'
      )
      return
    }

    setMensajeUbicacion(
      'Obteniendo ubicación...'
    )

    navigator.geolocation.getCurrentPosition(

      (position) => {

        setLatitud(
          position.coords.latitude
        )

        setLongitud(
          position.coords.longitude
        )

        setMensajeUbicacion(
          'Ubicación obtenida correctamente.'
        )
      },

      () => {

        setMensajeUbicacion('')

        setError(
          'No fue posible obtener tu ubicación. Revisa los permisos del navegador.'
        )
      },

      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    )
  }


  const handleSubmit = async (event) => {

    event.preventDefault()

    setError('')
    setMensaje('')

    if (
      !material ||
      !cantidad ||
      !direccion
    ) {
      setError(
        'Selecciona el material, la cantidad y escribe la dirección.'
      )
      return
    }

    if (
      material === 'otro' &&
      !otroMaterial.trim()
    ) {
      setError(
        'Describe el tipo de material.'
      )
      return
    }

    try {

      setCargando(true)

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error(
          'Debes iniciar sesión para publicar una solicitud.'
        )
      }

      const {
        error: insertError
      } = await supabase
        .from('solicitudes')
        .insert({
          generador_id: user.id,
          material: material,
          otro_material:
            material === 'otro'
              ? otroMaterial
              : null,
          cantidad: cantidad,
          direccion: direccion,
          latitud: latitud,
          longitud: longitud,
          estado: 'pendiente'
        })

      if (insertError) {
        throw insertError
      }

      setMensaje(
        'Solicitud publicada correctamente.'
      )

      setMaterial('')
      setOtroMaterial('')
      setCantidad('')
      setDireccion('')
      setLatitud(null)
      setLongitud(null)
      setMensajeUbicacion('')

      setTimeout(() => {
        navigate('/generador')
      }, 1500)

    } catch (err) {

      console.error(
        'Error publicando solicitud:',
        err
      )

      setError(
        err.message ||
        'No fue posible publicar la solicitud.'
      )

    } finally {

      setCargando(false)
    }
  }


  return (
    <main className="page-background">

      <section className="mobile-container collection-screen">

        <div className="collection-header">

          <div className="user-info">

            <img
              src={iconoUsuario}
              alt="Usuario"
              className="user-icon"
            />

            <span>
              Nueva solicitud
            </span>

          </div>

          <img
            src={logoERS}
            alt="ERS"
            className="collection-logo"
          />

        </div>


        <div className="section-title-green">
          Nueva recolección
        </div>


        <form
          className="collection-form"
          onSubmit={handleSubmit}
        >

          <h2>
            Tipo de Material
          </h2>


          <div className="materials-grid">

            <button
              type="button"
              className={
                material === 'carton'
                  ? 'material-button selected'
                  : 'material-button'
              }
              onClick={() =>
                setMaterial('carton')
              }
            >
              📦 Cartón y Papel
            </button>


            <button
              type="button"
              className={
                material === 'plastico'
                  ? 'material-button selected'
                  : 'material-button'
              }
              onClick={() =>
                setMaterial('plastico')
              }
            >
              🧴 Plástico
            </button>


            <button
              type="button"
              className={
                material === 'metales'
                  ? 'material-button selected'
                  : 'material-button'
              }
              onClick={() =>
                setMaterial('metales')
              }
            >
              🥫 Metales
            </button>


            <button
              type="button"
              className={
                material === 'vidrio'
                  ? 'material-button selected'
                  : 'material-button'
              }
              onClick={() =>
                setMaterial('vidrio')
              }
            >
              🫙 Vidrio
            </button>


            <button
              type="button"
              className={
                material === 'otro'
                  ? 'material-button selected'
                  : 'material-button'
              }
              onClick={() =>
                setMaterial('otro')
              }
            >
              ♻️ Otro
            </button>

          </div>


          {material === 'otro' && (

            <input
              type="text"
              placeholder="Describe el material"
              className="collection-input"
              value={otroMaterial}
              onChange={(e) =>
                setOtroMaterial(
                  e.target.value
                )
              }
            />

          )}


          <div className="section-title-green">
            Cantidad Aproximada
          </div>


          <div className="quantity-options">

            <label
              className={
                cantidad === 'pequeno'
                  ? 'quantity-card active'
                  : 'quantity-card'
              }
            >

              <input
                type="radio"
                name="cantidad"
                value="pequeno"
                checked={
                  cantidad === 'pequeno'
                }
                onChange={(e) =>
                  setCantidad(
                    e.target.value
                  )
                }
              />

              Pequeño (1 a 2 bolsas)

            </label>


            <label
              className={
                cantidad === 'mediano'
                  ? 'quantity-card active'
                  : 'quantity-card'
              }
            >

              <input
                type="radio"
                name="cantidad"
                value="mediano"
                checked={
                  cantidad === 'mediano'
                }
                onChange={(e) =>
                  setCantidad(
                    e.target.value
                  )
                }
              />

              Mediano (3 a 5 bolsas)

            </label>


            <label
              className={
                cantidad === 'grande'
                  ? 'quantity-card active'
                  : 'quantity-card'
              }
            >

              <input
                type="radio"
                name="cantidad"
                value="grande"
                checked={
                  cantidad === 'grande'
                }
                onChange={(e) =>
                  setCantidad(
                    e.target.value
                  )
                }
              />

              Grande (Más de 5 bolsas)

            </label>

          </div>


          <input
            type="text"
            placeholder="Escribe la dirección donde recogerlo"
            className="collection-input"
            value={direccion}
            onChange={(e) =>
              setDireccion(
                e.target.value
              )
            }
          />


          <div className="collection-secondary-actions">

            <label className="secondary-action">

              📷 Añadir foto

              <input
                type="file"
                accept="image/*"
                hidden
              />

            </label>


            <button
              type="button"
              className="location-button"
              onClick={obtenerUbicacion}
            >
              📍 Activar Localización
            </button>

          </div>


          {mensajeUbicacion && (

            <div className="location-message">
              {mensajeUbicacion}
            </div>

          )}


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
            className="primary-button publish-button"
            disabled={cargando}
          >

            {cargando
              ? 'Publicando...'
              : 'Publicar Solicitud'}

          </button>

        </form>


        <p className="help-text">
          ¿Necesitas Ayuda?
        </p>

      </section>

    </main>
  )
}

export default NuevaRecoleccion