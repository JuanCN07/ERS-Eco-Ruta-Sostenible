import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'


function RutaProtegida({
  children,
  rolPermitido
}) {

  const [cargando, setCargando] = useState(true)
  const [autorizado, setAutorizado] = useState(false)
  const [rolUsuario, setRolUsuario] = useState(null)


  useEffect(() => {

    verificarAcceso()

  }, [])


  const verificarAcceso = async () => {

    try {

      setCargando(true)


      // Obtener usuario autenticado
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()


      if (
        userError ||
        !user
      ) {

        setAutorizado(false)

        return
      }


      // Obtener rol
      const {
        data: perfil,
        error: profileError
      } = await supabase
        .from('profiles')
        .select('tipo_usuario')
        .eq('id', user.id)
        .single()


      if (
        profileError ||
        !perfil
      ) {

        setAutorizado(false)

        return
      }


      setRolUsuario(
        perfil.tipo_usuario
      )


      if (
        perfil.tipo_usuario ===
        rolPermitido
      ) {

        setAutorizado(true)

      } else {

        setAutorizado(false)

      }


    } catch (error) {

      console.error(
        'Error verificando acceso:',
        error
      )

      setAutorizado(false)


    } finally {

      setCargando(false)

    }

  }


  // ==========================================
  // CARGANDO
  // ==========================================

  if (cargando) {

    return (

      <main className="page-background">

        <section className="mobile-container">

          <div className="status-card">
            Verificando acceso...
          </div>

        </section>

      </main>

    )

  }


  // ==========================================
  // NO AUTENTICADO
  // ==========================================

  if (
    !autorizado &&
    !rolUsuario
  ) {

    return (
      <Navigate
        to="/login"
        replace
      />
    )

  }


  // ==========================================
  // ROL INCORRECTO
  // ==========================================

  if (
    !autorizado &&
    rolUsuario === 'generador'
  ) {

    return (
      <Navigate
        to="/generador"
        replace
      />
    )

  }


  if (
    !autorizado &&
    rolUsuario === 'reciclador'
  ) {

    return (
      <Navigate
        to="/reciclador"
        replace
      />
    )

  }


  // ==========================================
  // AUTORIZADO
  // ==========================================

  return children

}


export default RutaProtegida