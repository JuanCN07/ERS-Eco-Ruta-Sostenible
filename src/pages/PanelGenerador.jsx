import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate
} from 'react-router-dom'

import { supabase } from '../lib/supabase'

import logoERS from '../assets/logo-ers.png'
import iconoUsuario from '../assets/icono-usuario.png'


function PanelGenerador() {

  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false)


  useEffect(() => {

    cargarDatos()

    // Actualizar estados cada 5 segundos
    const intervalo = setInterval(() => {
      cargarDatos(false)
    }, 5000)

    return () => {
      clearInterval(intervalo)
    }

  }, [])


  // ==========================================
  // CARGAR DATOS
  // ==========================================

  const cargarDatos = async (mostrarCarga = true) => {

    try {

      if (mostrarCarga) {
        setCargando(true)
      }

      setError('')


      // Obtener usuario autenticado
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()


      if (userError || !user) {

        throw new Error(
          'No fue posible identificar al usuario.'
        )

      }


      // ==========================================
      // PERFIL
      // ==========================================

      const {
        data: perfil,
        error: profileError
      } = await supabase
        .from('profiles')
        .select('nombre')
        .eq('id', user.id)
        .single()


      if (profileError) {
        throw profileError
      }


      setNombre(perfil.nombre)


      // ==========================================
      // SOLICITUDES DEL GENERADOR
      // ==========================================

      const {
        data: solicitudesData,
        error: solicitudesError
      } = await supabase
        .from('solicitudes')
        .select(`
          id,
          material,
          otro_material,
          cantidad,
          direccion,
          latitud,
          longitud,
          estado,
          reciclador_id,
          kilos_recolectados,
          completed_at,
          created_at
        `)
        .eq('generador_id', user.id)
        .order(
          'created_at',
          {
            ascending: false
          }
        )


      if (solicitudesError) {
        throw solicitudesError
      }


      setSolicitudes(
        solicitudesData || []
      )


    } catch (err) {

      console.error(
        'Error cargando panel del generador:',
        err
      )


      setError(
        err.message ||
        'No fue posible cargar tus solicitudes.'
      )


    } finally {

      if (mostrarCarga) {
        setCargando(false)
      }

    }

  }


  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  const cerrarSesion = async () => {

    const confirmar = window.confirm(
      '¿Deseas cerrar la sesión?'
    )


    if (!confirmar) {
      return
    }


    try {

      const {
        error: logoutError
      } = await supabase.auth.signOut({
        scope: 'local'
      })


      if (logoutError) {
        throw logoutError
      }


      navigate(
        '/login',
        {
          replace: true
        }
      )


    } catch (err) {

      console.error(
        'Error cerrando sesión:',
        err
      )


      alert(
        'No fue posible cerrar la sesión.'
      )

    }

  }

// ==========================================
// ELIMINAR CUENTA
// ==========================================

const eliminarCuenta = async () => {

  const confirmacion = window.prompt(
    'Esta acción eliminará permanentemente tu cuenta y no se puede deshacer.\n\nEscribe ELIMINAR para continuar.'
  )


  if (
    confirmacion?.trim().toUpperCase() !== 'ELIMINAR'
  ) {

    return

  }


  try {

    setEliminandoCuenta(true)
    setError('')


    const {
      error: deleteError
    } = await supabase.rpc(
      'eliminar_mi_cuenta'
    )


    if (deleteError) {
      throw deleteError
    }


    // Limpiar la sesión local del navegador
    try {

      await supabase.auth.signOut({
        scope: 'local'
      })

    } catch (logoutError) {

      console.log(
        'La cuenta fue eliminada y la sesión se limpiará.',
        logoutError
      )

    }


    alert(
      'Tu cuenta fue eliminada correctamente.'
    )


    navigate(
      '/',
      {
        replace: true
      }
    )


  } catch (err) {

    console.error(
      'Error eliminando cuenta:',
      err
    )


    setError(
      err.message ||
      'No fue posible eliminar la cuenta.'
    )


  } finally {

    setEliminandoCuenta(false)

  }

}

  // ==========================================
  // NOMBRE DEL MATERIAL
  // ==========================================

  const obtenerNombreMaterial = (solicitud) => {

    if (
      solicitud.material === 'otro' &&
      solicitud.otro_material
    ) {

      return solicitud.otro_material

    }


    const materiales = {

      carton: 'Cartón y Papel',

      plastico: 'Plástico',

      metales: 'Metales',

      vidrio: 'Vidrio'

    }


    return (
      materiales[solicitud.material] ||
      solicitud.material
    )

  }


  // ==========================================
  // CANTIDAD
  // ==========================================

  const obtenerCantidad = (cantidad) => {

    const cantidades = {

      pequeno:
        'Pequeño (1 a 2 bolsas)',

      mediano:
        'Mediano (3 a 5 bolsas)',

      grande:
        'Grande (más de 5 bolsas)'

    }


    return (
      cantidades[cantidad] ||
      cantidad
    )

  }


  // ==========================================
  // ESTADO
  // ==========================================

  const obtenerEstado = (estado) => {

    const estados = {

      pendiente:
        'Esperando reciclador',

      aceptada:
        'Solicitud aceptada',

      en_camino:
        'Reciclador en camino',

      recolectada:
        'Recolección finalizada'

    }


    return (
      estados[estado] ||
      estado
    )

  }


  // ==========================================
  // SOLICITUD ACTUAL
  // ==========================================

  const solicitudActual =
    solicitudes.find(
      solicitud =>
        solicitud.estado === 'pendiente' ||
        solicitud.estado === 'aceptada' ||
        solicitud.estado === 'en_camino'
    )


  // ==========================================
  // HISTORIAL
  // ==========================================

  const historialSolicitudes =
    solicitudes.filter(
      solicitud =>
        solicitud.id !== solicitudActual?.id
    )


  // ==========================================
  // CONTADORES
  // ==========================================

  const totalSolicitudes =
    solicitudes.length


  const totalFinalizadas =
    solicitudes.filter(
      solicitud =>
        solicitud.estado === 'recolectada'
    ).length


  // ==========================================
  // KILOS RECICLADOS
  // ==========================================

  const totalKilos =
    solicitudes

      .filter(
        solicitud =>
          solicitud.estado === 'recolectada'
      )

      .reduce(
        (total, solicitud) =>

          total +
          Number(
            solicitud.kilos_recolectados || 0
          ),

        0
      )


  // ==========================================
  // INTERFAZ
  // ==========================================

  return (

    <main className="page-background">

      <section className="mobile-container dashboard-screen">


        {/* =====================================
            USUARIO
        ====================================== */}

        <div className="user-header">

          <div className="user-info">

            <img
              src={iconoUsuario}
              alt="Usuario"
              className="user-icon"
            />

            <span>
              Hola {nombre || 'Usuario'}
            </span>

          </div>


          <button
            type="button"
            className="logout-button"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>

        </div>


        {/* =====================================
            LOGO
        ====================================== */}

        <img
          src={logoERS}
          alt="ERS Eco Ruta Sostenible"
          className="dashboard-logo"
        />


        {/* =====================================
            NUEVA RECOLECCIÓN
        ====================================== */}

        <div className="dashboard-actions">

          <Link to="/nueva-recoleccion">

            <button
              type="button"
              className="primary-button dashboard-button"
            >
              Registrar Materiales y Solicitar Recolección
            </button>

          </Link>

        </div>


        {/* =====================================
            ESTADO ACTUAL
        ====================================== */}

        <div className="section-title-green">
          Estado de la solicitud
        </div>


        {cargando && (

          <div className="status-card">
            Cargando información...
          </div>

        )}


        {error && (

          <div className="form-message error-message">
            {error}
          </div>

        )}


        {!cargando &&
          !solicitudActual && (

            <div className="status-card">

              No tienes ninguna recolección
              activa en este momento.

            </div>

          )}


        {!cargando &&
          solicitudActual && (

            <div
              className={
                solicitudActual.estado === 'pendiente'

                  ? 'generator-request-card generator-pending'

                  : solicitudActual.estado === 'aceptada'

                  ? 'generator-request-card generator-accepted'

                  : 'generator-request-card generator-route'
              }
            >


              <div className="generator-material">

                ♻️{' '}

                {obtenerNombreMaterial(
                  solicitudActual
                )}

              </div>


              <p>

                <strong>
                  Cantidad:
                </strong>{' '}

                {obtenerCantidad(
                  solicitudActual.cantidad
                )}

              </p>


              <p>

                <strong>
                  Dirección:
                </strong>{' '}

                {solicitudActual.direccion}

              </p>


              <div
                className={
                  solicitudActual.estado === 'pendiente'

                    ? 'generator-status generator-status-pending'

                    : solicitudActual.estado === 'aceptada'

                    ? 'generator-status generator-status-accepted'

                    : 'generator-status generator-status-route'
                }
              >

                {solicitudActual.estado === 'pendiente' &&
                  '⏳ Esperando reciclador'}


                {solicitudActual.estado === 'aceptada' &&
                  '✓ Un reciclador aceptó tu solicitud'}


                {solicitudActual.estado === 'en_camino' &&
                  '🚚 Tu reciclador va en camino'}

              </div>


            </div>

          )}


        {/* =====================================
            ACTIVIDAD
        ====================================== */}

        <div className="section-title-green">
          Mi actividad
        </div>


        <div className="generator-summary generator-summary-three">


          <div className="generator-summary-item">

            <strong>
              {totalSolicitudes}
            </strong>

            <span>
              Solicitudes
            </span>

          </div>


          <div className="generator-summary-item">

            <strong>
              {totalFinalizadas}
            </strong>

            <span>
              Finalizadas
            </span>

          </div>


          <div className="generator-summary-item">

            <strong>
              {totalKilos.toFixed(1)}
            </strong>

            <span>
              Kg reciclados
            </span>

          </div>


        </div>


        {/* =====================================
            HISTORIAL
        ====================================== */}

        {historialSolicitudes.length > 0 && (

          <>

            <div className="section-title-green">
              Historial
            </div>


            <div className="generator-history">


              {historialSolicitudes.map(
                solicitud => (

                  <div
                    className="generator-history-card"
                    key={solicitud.id}
                  >


                    <div className="generator-history-header">

                      <strong>

                        {obtenerNombreMaterial(
                          solicitud
                        )}

                      </strong>


                      <span
                        className={
                          `history-status history-${solicitud.estado}`
                        }
                      >

                        {obtenerEstado(
                          solicitud.estado
                        )}

                      </span>

                    </div>


                    <p>

                      <strong>
                        Cantidad:
                      </strong>{' '}

                      {obtenerCantidad(
                        solicitud.cantidad
                      )}

                    </p>


                    <p>

                      <strong>
                        Dirección:
                      </strong>{' '}

                      {solicitud.direccion}

                    </p>


                    {solicitud.estado === 'recolectada' &&
                      solicitud.kilos_recolectados != null && (

                        <div className="generator-recycled-weight">

                          ♻️ Material recolectado:{' '}

                          <strong>

                            {Number(
                              solicitud.kilos_recolectados
                            ).toFixed(1)} Kg

                          </strong>

                        </div>

                      )}


                  </div>

                )
              )}


            </div>

          </>

        )}
        
        {/* =====================================
            ELIMINAR CUENTA
        ===================================== */}

        <div className="delete-account-section">

          <p className="delete-account-title">
            Eliminar cuenta
          </p>

          <p className="delete-account-warning">
            Al eliminar tu cuenta perderás permanentemente
            tu información y esta acción no se puede deshacer.
          </p>

          <button
            type="button"
            className="delete-account-button"
            onClick={eliminarCuenta}
            disabled={eliminandoCuenta}
          >

            {eliminandoCuenta
              ? 'Eliminando cuenta...'
              : 'Eliminar mi cuenta'}

          </button>

        </div>

        <p className="help-text">
          ¿Necesitas Ayuda?
        </p>


      </section>

    </main>

  )

}


export default PanelGenerador