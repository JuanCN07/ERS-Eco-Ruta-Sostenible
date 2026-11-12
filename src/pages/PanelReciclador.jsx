import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

import logoERS from '../assets/logo-ers.png'
import iconoUsuario from '../assets/icono-usuario.png'

import { useNavigate } from 'react-router-dom'

function PanelReciclador() {

  const [nombre, setNombre] = useState('')
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [disponible, setDisponible] = useState(false)
  const navigate = useNavigate()
  

  const [kilosPorSolicitud, setKilosPorSolicitud] = useState({})
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false)

  useEffect(() => {

    cargarDatos()

  }, [])



  // ==========================================
  // CARGAR PERFIL Y SOLICITUDES
  // ==========================================

  const cargarDatos = async () => {

    try {

      setCargando(true)
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
      // PERFIL DEL RECICLADOR
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
      // SOLICITUDES DEL RECICLADOR
      // ==========================================

      const {
        data: solicitudesPropias,
        error: propiasError
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
        .eq('reciclador_id', user.id)
        .in(
          'estado',
          [
            'aceptada',
            'en_camino',
            'recolectada',
          ]
        )
        .order(
          'created_at',
          {
            ascending: false
          }
        )


      if (propiasError) {
        throw propiasError
      }


      // ==========================================
      // SOLICITUDES PENDIENTES
      // ==========================================

      const {
        data: solicitudesPendientes,
        error: pendientesError
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
        .eq('estado', 'pendiente')
        .order(
          'created_at',
          {
            ascending: false
          }
        )


      if (pendientesError) {
        throw pendientesError
      }


      // ==========================================
      // UNIR SOLICITUDES
      // ==========================================

      const todasLasSolicitudes = [

        ...(solicitudesPropias || []),

        ...(solicitudesPendientes || [])

      ]


      setSolicitudes(
        todasLasSolicitudes
      )


    } catch (err) {

      console.error(
        'Error cargando panel:',
        err
      )


      setError(
        err.message ||
        'No fue posible cargar las solicitudes.'
      )


    } finally {

      setCargando(false)

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
  // ACEPTAR SOLICITUD
  // ==========================================

  const aceptarSolicitud = async (solicitudId) => {

    try {

      setError('')


      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()


      if (userError || !user) {

        throw new Error(
          'No fue posible identificar al reciclador.'
        )

      }


      const {
        data,
        error: updateError
      } = await supabase
        .from('solicitudes')
        .update({

          reciclador_id: user.id,

          estado: 'aceptada'

        })
        .eq(
          'id',
          solicitudId
        )
        .eq(
          'estado',
          'pendiente'
        )
        .select()


      if (updateError) {
        throw updateError
      }


      if (
        !data ||
        data.length === 0
      ) {

        throw new Error(
          'La solicitud ya fue aceptada por otro reciclador.'
        )

      }


      alert(
        'Solicitud aceptada correctamente.'
      )


      await cargarDatos()


    } catch (err) {

      console.error(
        'Error aceptando solicitud:',
        err
      )


      setError(
        err.message ||
        'No fue posible aceptar la solicitud.'
      )

    }

  }


  // ==========================================
  // INICIAR RECORRIDO
  // ==========================================

  const iniciarRecorrido = async (solicitudId) => {

    try {

      setError('')


      const {
        data,
        error: updateError
      } = await supabase
        .from('solicitudes')
        .update({

          estado: 'en_camino'

        })
        .eq(
          'id',
          solicitudId
        )
        .eq(
          'estado',
          'aceptada'
        )
        .select()


      if (updateError) {
        throw updateError
      }


      if (
        !data ||
        data.length === 0
      ) {

        throw new Error(
          'No fue posible iniciar el recorrido.'
        )

      }


      alert(
        'Recorrido iniciado correctamente.'
      )


      await cargarDatos()


    } catch (err) {

      console.error(
        'Error iniciando recorrido:',
        err
      )


      setError(
        err.message ||
        'No fue posible iniciar el recorrido.'
      )

    }

  }


  // ==========================================
  // CANCELAR RECOLECCIÓN
  // ==========================================

  const cancelarRecoleccion = async (solicitudId) => {

  const confirmar =
    window.confirm(
      '¿Deseas liberar esta solicitud para que otro reciclador pueda aceptarla?'
    )

  if (!confirmar) {
    return
  }


  try {

    setError('')


    const {
      data,
      error: updateError
    } = await supabase
      .from('solicitudes')
      .update({

        estado: 'pendiente',

        reciclador_id: null,

        kilos_recolectados: null,

        completed_at: null

      })
      .eq(
        'id',
        solicitudId
      )
      .in(
        'estado',
        [
          'aceptada',
          'en_camino'
        ]
      )
      .select()


    if (updateError) {
      throw updateError
    }


    if (
      !data ||
      data.length === 0
    ) {

      throw new Error(
        'No fue posible liberar la solicitud.'
      )

    }


    alert(
      'La solicitud fue liberada y vuelve a estar disponible para otros recicladores.'
    )


    await cargarDatos()


  } catch (err) {

    console.error(
      'Error liberando solicitud:',
      err
    )


    setError(
      err.message ||
      'No fue posible liberar la solicitud.'
    )

  }

}


  // ==========================================
  // FINALIZAR RECOLECCIÓN
  // ==========================================

  const finalizarRecoleccion =
    async (solicitudId) => {


      const kilos = parseFloat(
        kilosPorSolicitud[
          solicitudId
        ]
      )


      if (
        Number.isNaN(kilos) ||
        kilos <= 0
      ) {

        alert(
          'Ingresa una cantidad válida de kilogramos recolectados.'
        )

        return

      }


      const confirmar =
        window.confirm(
          `¿Confirmas que recolectaste ${kilos} Kg y deseas finalizar la recolección?`
        )


      if (!confirmar) {
        return
      }


      try {

        setError('')


        const {
          data,
          error: updateError
        } = await supabase
          .from('solicitudes')
          .update({

            estado:
              'recolectada',

            kilos_recolectados:
              kilos,

            completed_at:
              new Date().toISOString()

          })
          .eq(
            'id',
            solicitudId
          )
          .eq(
            'estado',
            'en_camino'
          )
          .select()


        if (updateError) {
          throw updateError
        }


        if (
          !data ||
          data.length === 0
        ) {

          throw new Error(
            'No fue posible finalizar la recolección.'
          )

        }


        alert(
          'Recolección finalizada correctamente.'
        )


        setKilosPorSolicitud(
          prev => ({

            ...prev,

            [solicitudId]: ''

          })
        )


        await cargarDatos()


      } catch (err) {

        console.error(
          'Error finalizando recolección:',
          err
        )


        setError(
          err.message ||
          'No fue posible finalizar la recolección.'
        )

      }

    }


  // ==========================================
  // VER UBICACIÓN
  // ==========================================

  const verUbicacion = (solicitud) => {

    if (
      solicitud.latitud == null ||
      solicitud.longitud == null
    ) {

      alert(
        'Esta solicitud no tiene una ubicación registrada.'
      )

      return

    }


    const url =
      `https://www.google.com/maps/search/?api=1&query=${solicitud.latitud},${solicitud.longitud}`


    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    )

  }


  // ==========================================
  // CONTADORES
  // ==========================================

  const solicitudesPendientes =
    solicitudes.filter(

      solicitud =>
        solicitud.estado ===
        'pendiente'

    ).length


  const solicitudesAceptadas =
    solicitudes.filter(

      solicitud =>
        solicitud.estado ===
        'aceptada'

    ).length


  // ==========================================
  // KILOS RECOLECTADOS HOY
  // ==========================================

  const esHoy = (fecha) => {

    if (!fecha) {
      return false
    }


    const fechaRecoleccion =
      new Date(fecha)


    const hoy =
      new Date()


    return (

      fechaRecoleccion.getFullYear() ===
        hoy.getFullYear() &&

      fechaRecoleccion.getMonth() ===
        hoy.getMonth() &&

      fechaRecoleccion.getDate() ===
        hoy.getDate()

    )

  }


  const kilosRecolectadosHoy =
    solicitudes

      .filter(
        solicitud =>
          solicitud.estado ===
            'recolectada' &&
          esHoy(
            solicitud.completed_at
          )
      )

      .reduce(
        (total, solicitud) =>

          total +
          Number(
            solicitud.kilos_recolectados ||
            0
          ),

        0
      )

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
  // INTERFAZ
  // ==========================================

  return (

    <main className="page-background">

      <section
        className="mobile-container dashboard-screen"
      >


        {/* =========================
            USUARIO
        ========================= */}

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


        {/* =========================
            LOGO
        ========================= */}

        <img
          src={logoERS}
          alt="ERS Eco Ruta Sostenible"
          className="dashboard-logo"
        />


        {/* =========================
            DISPONIBILIDAD
        ========================= */}

        <div className="availability-row">

          <span>
            Activar disponibilidad
          </span>


          <label className="switch">

            <input
              type="checkbox"

              checked={
                disponible
              }

              onChange={
                (e) =>
                  setDisponible(
                    e.target.checked
                  )
              }
            />

            <span
              className="slider"
            ></span>

          </label>

        </div>


        {/* =========================
            SOLICITUDES
        ========================= */}

        <div className="section-title-green">
          Solicitudes
        </div>


        {/* CARGANDO */}

        {cargando && (

          <div className="status-card">

            Cargando solicitudes...

          </div>

        )}


        {/* ERROR */}

        {error && (

          <div
            className="form-message error-message"
          >

            {error}

          </div>

        )}


        {/* SIN SOLICITUDES */}

        {!cargando &&
          solicitudes.length === 0 && (

            <div className="status-card">

              ✅ No hay solicitudes
              registradas en este momento.

            </div>

          )}


        {/* =========================
            LISTADO
        ========================= */}

        {!cargando &&
          solicitudes.length > 0 && (

            <div className="requests-list">


              {/* RESUMEN */}

              <div className="requests-summary">

                <span>

                  📍 Pendientes:{' '}

                  {
                    solicitudesPendientes
                  }

                </span>


                <span>

                  ✓ Aceptadas:{' '}

                  {
                    solicitudesAceptadas
                  }

                </span>

              </div>


              {/* TARJETAS */}

              {solicitudes.map(
                solicitud => (

                  <div

                    key={
                      solicitud.id
                    }

                   className={
                    solicitud.estado === 'aceptada'
                        ? 'request-card request-card-accepted'
                        : solicitud.estado === 'en_camino'
                        ? 'request-card request-card-route'
                        : solicitud.estado === 'recolectada'
                        ? 'request-card request-card-completed'
                        : 'request-card'
                    }
                  >


                    {/* MATERIAL */}

                    <div
                      className="request-material"
                    >

                      ♻️{' '}

                      {
                        obtenerNombreMaterial(
                          solicitud
                        )
                      }

                    </div>


                    {/* CANTIDAD */}

                    <p>

                      <strong>
                        Cantidad:
                      </strong>{' '}

                      {
                        obtenerCantidad(
                          solicitud.cantidad
                        )
                      }

                    </p>


                    {/* DIRECCIÓN */}

                    <p>

                      <strong>
                        Dirección:
                      </strong>{' '}

                      {
                        solicitud.direccion
                      }

                    </p>


                    {/* ESTADO */}

                    <p>

                      <strong>
                        Estado:
                      </strong>{' '}


                      {
                        solicitud.estado ===
                        'pendiente' &&
                        'Pendiente'
                      }


                      {
                        solicitud.estado ===
                        'aceptada' &&
                        'Aceptada'
                      }


                      {
                        solicitud.estado ===
                        'en_camino' &&
                        'En camino'
                      }


                      {
                        solicitud.estado ===
                        'recolectada' &&
                        'Recolectada'
                      } 

                    </p>


                    {/* UBICACIÓN */}

                    {
                      solicitud.latitud != null &&
                      solicitud.longitud != null &&
                      solicitud.estado !==
                        'cancelada' && (

                        <p className="location-ok">

                          📍 Ubicación disponible

                        </p>

                      )
                    }


                    {/* =========================
                        PENDIENTE
                    ========================= */}

                    {
                      solicitud.estado ===
                      'pendiente' && (

                        <button

                          type="button"

                          className="accept-request-button"

                          onClick={() =>
                            aceptarSolicitud(
                              solicitud.id
                            )
                          }

                        >

                          Aceptar solicitud

                        </button>

                      )
                    }


                    {/* =========================
                        ACEPTADA
                    ========================= */}

                    {
                      solicitud.estado ===
                      'aceptada' && (

                        <div className="accepted-actions">


                          <div
                            className="accepted-request-label"
                          >

                            ✓ Solicitud aceptada

                          </div>


                          {/* SWITCH */}

                          <div
                            className="collection-switch-box"
                          >

                            <span
                              className="collection-switch-text"
                            >

                              Recolección aceptada

                            </span>


                            <label
                              className="collection-switch"
                            >

                              <input

                                type="checkbox"

                                checked={true}

                                onChange={(e) => {

                                  if (
                                    !e.target.checked
                                  ) {

                                    cancelarRecoleccion(
                                      solicitud.id
                                    )

                                  }

                                }}

                              />

                              <span
                                className="collection-slider"
                              ></span>

                            </label>

                          </div>


                          {/* VER UBICACIÓN */}

                          {
                            solicitud.latitud != null &&
                            solicitud.longitud != null && (

                              <button

                                type="button"

                                className="location-request-button"

                                onClick={() =>
                                  verUbicacion(
                                    solicitud
                                  )
                                }

                              >

                                📍 Ver ubicación

                              </button>

                            )
                          }


                          {/* INICIAR */}

                          <button

                            type="button"

                            className="start-route-button"

                            onClick={() =>
                              iniciarRecorrido(
                                solicitud.id
                              )
                            }

                          >

                            🚚 Iniciar recorrido

                          </button>


                        </div>

                      )
                    }


                    {/* =========================
                        EN CAMINO
                    ========================= */}

                    {
                      solicitud.estado ===
                      'en_camino' && (

                        <div className="accepted-actions">


                          <div
                            className="route-request-button"
                          >

                            🚚 Recolección en camino

                          </div>


                          {/* SWITCH */}

                          <div
                            className="collection-switch-box"
                          >

                            <span
                              className="collection-switch-text"
                            >

                              Recolección activa

                            </span>


                            <label
                              className="collection-switch"
                            >

                              <input

                                type="checkbox"

                                checked={true}

                                onChange={(e) => {

                                  if (
                                    !e.target.checked
                                  ) {

                                    cancelarRecoleccion(
                                      solicitud.id
                                    )

                                  }

                                }}

                              />

                              <span
                                className="collection-slider"
                              ></span>

                            </label>

                          </div>


                          {/* VER UBICACIÓN */}

                          {
                            solicitud.latitud != null &&
                            solicitud.longitud != null && (

                              <button

                                type="button"

                                className="location-request-button"

                                onClick={() =>
                                  verUbicacion(
                                    solicitud
                                  )
                                }

                              >

                                📍 Ver ubicación

                              </button>

                            )
                          }


                          {/* =========================
                              KILOS
                          ========================= */}

                          <div
                            className="collection-weight-box"
                          >

                            <label>

                              Kilogramos recolectados

                            </label>


                            <input

                              type="number"

                              min="0.1"

                              step="0.1"

                              placeholder="Ejemplo: 4.5"

                              value={
                                kilosPorSolicitud[
                                  solicitud.id
                                ] || ''
                              }

                              onChange={(e) =>

                                setKilosPorSolicitud(
                                  prev => ({

                                    ...prev,

                                    [solicitud.id]:
                                      e.target.value

                                  })
                                )

                              }

                            />

                          </div>


                          {/* FINALIZAR */}

                          <button

                            type="button"

                            className="finish-collection-button"

                            onClick={() =>
                              finalizarRecoleccion(
                                solicitud.id
                              )
                            }

                          >

                            ✓ Finalizar recolección

                          </button>


                        </div>

                      )
                    }


                    {/* =========================
                        RECOLECTADA
                    ========================= */}

                    {
                      solicitud.estado ===
                      'recolectada' && (

                        <div className="completed-info">


                          <div
                            className="completed-request-label"
                          >

                            ✓ Recolección finalizada

                          </div>


                          {
                            solicitud.kilos_recolectados != null && (

                              <p
                                className="completed-weight"
                              >

                                ♻️ Total recolectado:{' '}

                                <strong>

                                  {
                                    Number(
                                      solicitud.kilos_recolectados
                                    ).toFixed(1)
                                  } Kg

                                </strong>

                              </p>

                            )
                          }


                        </div>

                      )
                    }


                    {/* =========================
                        CANCELADA
                    ========================= */}

                    {
                      solicitud.estado ===
                      'cancelada' && (

                        <div
                          className="cancelled-request-label"
                        >

                          ✕ Recolección cancelada

                        </div>

                      )
                    }


                  </div>

                )
              )}


            </div>

          )}


        {/* =========================
            RESUMEN DIARIO
        ========================= */}

        <div className="section-title-green">

          Resumen diario

        </div>


        <div className="summary-card">

          Hoy has recolectado:{' '}

          <strong>

            {
              kilosRecolectadosHoy
                .toFixed(1)
            } Kg

          </strong>

        </div>
        
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


export default PanelReciclador