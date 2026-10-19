# Catálogo de referencias móviles — C:\Users\Dreitz\Desktop\xd

Todas las capturas son de la app móvil de X (Twitter) en español, tema oscuro (#000).
Objetivo: replicar EXACTAMENTE esas pantallas/patrones en la web móvil de Talma (React + Tailwind).
Marca: se usa "Talma" donde X usa "X". Se conserva la ESTRUCTURA y ESTILO, no la marca ajena.

## Sistema de diseño observado
- Fondo: #000000 puro. Texto primario #e7e9ea, secundario #71767b. Borde/divisor: #2f3336.
- Azul marca: #1d9bf0. Like: #f91880. Repost: #00ba7c. Error/eliminar: rojo (#f4212e aprox).
- Header sticky: altura 53px, `bg-black/80 backdrop-blur-md`, título centrado 20px font-extrabold.
- Barra inferior de pestañas: iconos 26px; activa = relleno blanco; inactiva = gris #71767b.
- Indicador de pestaña activa: barra azul de 4px, redondeada, bajo el label.
- FAB: círculo azul 56px, bottom ~80px, right 16px, icono + blanco.
- Filas de lista: padding 16px, hover sutil, divisor 1px #2f3336.
- Pantallas de ajuste: header con flecha atrás + título + "@usuario" en gris debajo.
- Textos secundarios bajo cada opción: 13px #71767b, line-height normal.

## 1.jpeg — Explorar
- Fila superior: avatar 32px (abre drawer) | píldora de búsqueda central (fondo #202327, radio full, icono lupa + placeholder "Buscar") | engranaje de ajustes a la derecha.
- Pestañas: **Explorar** (activa), Tendencias, Noticias, Deportes, (Entretenimiento cortado). Scroll horizontal, sin scrollbar.
- Lista de tendencias: línea superior 13px gris "Tendencia en Perú" / "Deportes · Tendencia" / "Familia & relaciones · Tendencia"; línea principal 15px bold blanca "#YdaleU", "Ángelus", "Valverde"...
- Cada fila tiene "⋮" (MoreHorizontal) gris a la derecha.
- **No hay banner destacado con imagen** en esta referencia: la lista de tendencias va directa.
- FAB azul + y barra inferior de 5 iconos.

## 2.jpeg (duplicado: 224.jpeg es otra pantalla) — Notificaciones
- Header: avatar 32px izquierda | "Notificaciones" centrado bold 20px | engranaje derecha.
- Pestañas: **Todas** (activa, con icono campana), Menciones, Verificado.
- Filas de notificación: icono pequeño a la IZQUIERDA (destello morado para "post reciente"; persona azul para "te siguió"), luego avatar circular 40px, luego texto.
  - Fila 1: "Post reciente de **Mafegjordano** · 1 s" + preview del post en gris 2 líneas.
  - Fila 2: "**hermixy†** te siguió · 1 s".
  - "⋮" a la derecha en cada fila.
- Fondo vacío negro tras las 2 filas.
- FAB azul + y barra inferior.

## 3.jpeg — Chat (lista de conversaciones)
- Header: avatar 32px | "Chat" centrado bold | píldora "Todo ⌄" con borde #2f3336 a la derecha.
- Debajo: píldora de búsqueda ancha centrada (icono lupa + "Buscar"), fondo #202327.
- Filas de conversación: avatar 56px | nombre bold 17px + check azul si verificado | hora a la derecha (5d, 1s, 3s, 7s) | preview del último mensaje en gris 15px, una línea truncada.
- Sin divisor visible entre filas (muy sutil).
- Barra inferior: icono de mensajes ACTIVO (burbuja rellena blanca).

## 4.jpeg — Drawer / menú lateral (perfil propio)
- Fila superior: logo/avatar 40px | "⋮" a la derecha.
- "**Dreftian** 🔒" (candado = cuenta protegida) 17px extrabold.
- "@Dreftian" 14px gris.
- "**455** Siguiendo  **4** Seguidores" (números en blanco bold, etiquetas gris).
- Divisor.
- Ítems (icono 20px + label 17px bold, alto ~52px):
  1. 👤 Perfil
  2. ✅ Premium [píldora azul "50% de descuento"]
  3. 👥 Comunidades
  4. 🔖 Guardados
  5. 📋 Listas
  6. 🎙️ Espacios
  7. 👤+ Solicitudes de seguimiento
  8. 🚀 Estudio para creadores
- Divisor.
- "🕊️ Abrir Grok" (texto atenuado por scroll), "🌙 Configuración y privacidad" (atenuado).

## 5.jpeg — Drawer (continuación, scrolled)
- Mismos ítems vistos desde "Comunidades": Comunidades, Guardados, Listas, Espacios, Solicitudes de seguimiento, Estudio para creadores.
- Divisor.
- Iconos más pequeños (18px) + label 15px normal:
  - 🕊️ Abrir Grok
  - ⚙️ Configuración y privacidad
  - ❓ Centro de Ayuda
  - 🌙 (icono de luna suelto abajo)

## 6.jpeg — Configuración (principal)
- Header: ← | "Configuración" 19px extrabold + "@Dreftian" gris debajo.
- Píldora de búsqueda: "Configuración de búsqueda".
- 6 filas con icono 24px gris a la izquierda y bloque título+descripción:
  1. 👤 **Tu cuenta** — "Consulta la información de tu cuenta, descarga un archivo con tus datos u obtén más información acerca de las opciones de desactivación de la cuenta."
  2. 🔒 **Seguridad y acceso a la cuenta** — "Administra la seguridad de tu cuenta y lleva un control de su uso, incluidas las apps que conectaste a ella."
  3. 🛡️ **Privacidad y seguridad** — "Administra qué información ves y compartes en X."
  4. 🔔 **Notificaciones** — "Selecciona los tipos de notificaciones que quieres recibir sobre tus actividades, intereses y recomendaciones."
  5. ♿ **Accesibilidad, pantalla e idiomas** — "Administra cómo ves el contenido de X."
  6. 🔗 **Recursos adicionales** — "Consulta otros lugares para obtener más información útil sobre los productos y servicios de X."
- Footer centrado gris: "12.35.0-prod.01".

## 7.jpeg — Perfil propio (contenido)
- Banner de imagen arriba (~136px móvil). Sobre el banner, 4 círculos negros semitransparentes (36px): ← (izq), y a la derecha: 🕊️ fantasma, 🔍 lupa, ⋯ menú.
- Avatar 80px circular con borde negro, solapado sobre el banner (mitad).
- Nombre "**Dreftian** 🔒" 20px extrabold + píldora "✅ Obtener verificación" (borde #2f3336, radio full, texto bold 14px).
- "@Dreftian" gris.
- Bio multilínea 15px.
- Metadatos en fila con iconos: "📍 Perú - Lima"  "🎂 Fecha de nacimiento: marzo 23, 1998".
- "📅 Se unió en julio 2020 ›" (con chevron).
- "**455** Siguiendo  **4** Seguidores".
- Dos botones outline lado a lado, radio full, alto 40px: "Compartir" | "Editar perfil".
- Pestañas con iconos: 📄 "Posts ⌄" (activa, expandida con texto + subrayado blanco), 💬 (respuestas), 🔁 (reposts), 🎬 (videos). La activa muestra label y barra blanca; las inactivas solo icono.
- Sección "**A quién seguir**" 20px extrabold, con carrusel horizontal de tarjetas grandes.
- FAB azul +, barra inferior (icono perfil activo).

## 8.jpeg — Perfil propio con menú ⋯ abierto
- Igual que 7.jpeg pero con menú desplegable bajo el botón ⋯ (esquina superior derecha del banner):
  - "✏️ Borradores"
  - "📋 Listas en las que estás"
- Menú: fondo #16181c, radio 16px, sombra, filas 15px.

## 9.jpeg — Perfil > pestaña Reposts
- Header sticky compacto sobre el banner: ← | "**Dreftian** 🔒 / 89 posts" | 🕊️ 🔍 ⋯ (círculos negros).
- Debajo se ven (por scroll): "📅 Se unió en julio 2020 ›", "455 Siguiendo 4 Seguidores", botones Compartir/Editar perfil.
- Pestañas: 📄 | 💬 | 🔁 "**Reposts**" (activa, con label y barra BLANCA) | 🎬.
- Post reposteado: arriba en gris "🔁 Tú reposteaste" 13px, luego el post normal.
- El post muestra "Traducido del chino · Mostrar original" en azul, texto, enlace azul, "Mostrar más", imagen.

## 11.jpeg — Perfil > pestaña Respuestas
- Igual estructura. Pestaña activa "💬 **Respuestas**" con barra blanca.
- Post de respuesta con línea vertical conectora a la izquierda del avatar (hilo).
- "Traducido del chino · Mostrar original", texto, imagen.

## 12.jpeg — Perfil > pestaña Videos (estado vacío)
- Pestaña activa "🎬 **Videos** ⌄" con barra blanca.
- Estado vacío centrado-izquierda: título enorme 31px extrabold "**Luz, cámara... ¡adjuntos!**" (2 líneas) y debajo gris 15px "Tus posts de video aparecerán aquí."

## 13.jpeg — Perfil > pestaña Artículos (estado vacío)
- Pestaña activa "📝 **Artículos**" con barra blanca.
- Estado vacío: título 31px extrabold "**Escribe artículos en X**", párrafo gris "Cuando publiques un Artículo en x.com, se mostrará aquí. Solo las personas suscritas a Premium pueden publicar Artículos."
- Botón azul radio full: "Suscríbete a Premium" (texto blanco bold).

## 15.jpeg — Perfil > pestaña Me gusta
- Pestaña activa "❤️ **Me gusta**" con barra blanca.
- Post con imagen grande; barra de acciones: 💬27 🔁207 ❤️1.9K (rosa) 📊89K 🔖 ↗.

## 112.jpeg — Notificaciones (ajustes)
- Header: ← | "Notificaciones" + "@Dreftian".
- Párrafo gris: "Selecciona los tipos de notificaciones que quieres recibir sobre tus actividades, intereses y recomendaciones."
- 2 filas con icono 24px:
  - 🎚️ **Filtros** — "Elige las notificaciones que quieres ver, y las que no."
  - ⚙️ **Preferencias** — "Selecciona tus preferencias por tipo de notificación."

## 224.jpeg — Seguridad y acceso > Seguridad
- Header ← | "Seguridad" + "@Dreftian".
- Párrafo gris "Administra la seguridad de tu cuenta."
- Sección "**Autenticación en dos fases**" (título 19px bold) + párrafo largo + fila "Autenticación en dos fases".
- Sección "**Verificación de documento de identidad**" + párrafo + fila.
- Sección "**Protección con contraseña adicional**".
  - "**Protección de restablecimiento de contraseña**" + párrafo + **toggle switch** a la derecha (apagado, gris).
  - "**Administrar claves de acceso**" + párrafo con "Más información" azul.

## 123123123.jpeg — Home feed "Siguiendo"
- Header: avatar | logo X centrado | píldora azul "✅ Actualizar a nivel..." a la derecha (CTA de suscripción).
- Pestañas: "Para ti ⌄", "**Siguiendo**" (activa, subrayado blanco), "Bebés 💖✨", "+".
- Post normal con acciones.
- Post de anuncio: avatar/logo, "**Tangem** ✅ @Tangem · Ad ⋮", texto, imagen grande.

## 12312354.jpeg — Verificación SMS
- Título 28px extrabold "**Te enviamos un código**".
- Párrafo: "Introduce el código de verificación enviado a dr******@hotmail.com."
- Input grande con borde azul 2px, placeholder "Introduce el código de verificación".
- Enlace azul "¿No recibiste un código?".
- Abajo a la derecha, botón píldora gris deshabilitado "Confirmar".

## 21412421.jpeg — Apps y sesiones
- Header ← | "Apps y sesiones".
- Párrafo gris.
- Filas con chevron › a la derecha: "Aplicaciones conectadas", "Sesiones", "Historial de acceso a la cuenta", "Dispositivos y aplicaciones que iniciaron sesión" (2 líneas).

## asdad.jpeg — Privacidad y seguridad
- Header ← | "Privacidad y seguridad" + "@Dreftian".
- Título de sección "**Tu actividad de X**".
- Filas con icono 24px:
  - 👥 **Audiencia y etiquetas** — "Administra qué información permites que vean otras personas en X."
  - ✏️ **Tus posts** — "Administra la información asociada a tus posts."
  - 🎛️ **Contenido que ves** — "Decida qué ver en X en función de sus preferencias."
  - 🔇 **Silenciar y bloquear** — "Administra las cuentas, palabras y notificaciones que silenciaste o bloqueaste."
  - 💬 **Chats** — "Administra quiénes pueden enviarte mensajes directamente."
  - 🔍 **Visibilidad y contactos** — "Controla tu configuración de visibilidad y administra los contactos que hayas importado."
  - 🌐 **Acerca de tu cuenta** — "Administra la ubicación asociada a tu cuenta".
- Divisor y nueva sección "**Intercambio y personalización de datos**".

## qweqwe.jpeg (= WhatsApp Image 2026-10-1123123128) — Información de la cuenta
- Header ← | "Información de la cuenta" + "@Dreftian".
- Filas con icono 24px + título bold + subtítulo gris:
  - @ **Nombre de usuario** / @Dreftian
  - 📞 **Teléfono** / +51903053478
  - ✉️ **Correo electrónico** / dreftian@hotmail.com
  - 🌍 **País** / Perú / "Selecciona el país en el que vives. Más información"
  - 🤖 **Automatización** / "Administra tu cuenta automatizada."
  - 🎭 **Etiqueta de perfil**
  - 🚪 **Cerrar sesión** (icono y texto ROJOS)

## rdsfsdf.jpeg — Agregar etiqueta al perfil
- Header ← | "Agregar etiqueta al perfil" + "@Dreftian".
- Párrafo gris con "Más información" azul.
- "**Etiqueta de perfil**" / "Ninguno" gris.

## WhatsApp Image 2026-10-18 at 5.58.20 PM.jpeg — Home "Para ti"
- Header: avatar | logo X centrado | píldora azul "✅ Actualizar a nivel..." derecha.
- Pestañas: "**Para ti** ⌄" (activa, subrayado blanco), "Siguiendo", "Bebés 💖✨", "+".
- Post normal: avatar, nombre ✅ @handle · 7h, ⋮ y 🕊️ a la derecha, texto, imagen con botón mute abajo-derecha.
- Acciones: 💬40 🔁185 ❤️1.3K 📊64K 🔖 ↗.
- Post de anuncio: logo cuadrado azul, "**BingX** ✅ @BingXOfficial · Ad ⋮", texto.
- FAB azul +.

## WhatsApp Image 2026-10-18 at 5.58.26 qwe.jpeg — Teléfono
- Header ← | "Teléfono" + "@Dreftian".
- Fila: 📞 Teléfono / +51903053478.
- Fila: ✏️ "Actualizar número de teléfono".
- Fila: 🗑️ "Eliminar número de teléfono" (icono y texto ROJOS).

## WhatsAp111p Image 2026-10-18 at 5.58.28 PM.jpeg — Preferencias (notificaciones)
- Header ← | "Preferencias" + "@Dreftian".
- Párrafo gris + "Más información" azul.
- Filas con icono 24px, label bold: 🔔 "Notificaciones push", ✉️ "Notificaciones de correo electrónico". (Sin toggle visible en esta captura; en X son toggles.)

## WhatsApp  rrr2026-10-18 at 5.58.27 PM.jpeg — Automatización
- Header ← | "Automatización" + "@Dreftian".
- Párrafo gris "Administra tu cuenta automatizada."
- "**Definir una cuenta de administración**" 17px.
- Párrafo largo con "Más información" azul.

## WhatsApp 21122026-10-18 at 5.58.29 PM.jpeg — Post (con respuestas)
- Post grande: avatar, nombre, texto con cita, imagen/video con mute, "11:02 p. m. · 17 oct. 26 · **21.8K** Visualizaciones".
- Barra de acciones: 💬1 🔁332 ❤️2.6K 🔖160 ↗.
- Respuestas en hilo con línea conectora vertical.
- Abajo, composer fijo: avatar 32px + píldora "Postea tu respuesta" + iconos 📷 🎞️ (GIF) y ⛶ (expandir).

## WhatsApp 2131231232026-10-18 at 5.58.26 PM.jpeg — Tu cuenta
- Header ← | "Tu cuenta" + "@Dreftian".
- Párrafo gris.
- Filas con icono 24px:
  - 👤 **Información de la cuenta** — "Consulta la información de tu cuenta, como el número de teléfono y la dirección de correo electrónico."
  - 🔒 **Cambia tu contraseña** — "Cambia tu contraseña en cualquier momento."
  - ⬇️ **Descarga un archivo con tus datos** — "Hazte una idea del tipo de información que se almacena de tu cuenta."
  - 💔 **Desactivar tu cuenta** — "Averigua cómo puedes desactivar tu cuenta."

## WhatsApp Ima222334ge 2026-10-18 at 5.58.29 PM.jpeg — Pantalla de respuesta (compose reply)
- Header: "✕" a la izquierda | botón azul píldora "**Responder**" a la derecha (deshabilitado).
- Arriba: post original resumido con avatar 40px, nombre bold + @handle · 18h, texto, y línea vertical conectora.
- Debajo: "Respondiendo a @pkzz98l y a @moonlitecora" (handles en azul).
- Avatar 40px + "Publicar tu respuesta" como placeholder grande en gris.
- Barra inferior de iconos de composición (7 iconos azules/grises): 🖼️ 📷 🎙️ GIF ☰ 📍 🚩 y círculo de progreso a la derecha.

## WhatsApp Imag2223e 2026-10-18 at 5.58.28 PM.jpeg — Post (otro usuario)
- Header: ← | "Post" | 🕊️.
- Autor: avatar 48px, nombre bold + @handle, botón blanco "**Seguir**" a la derecha, ⋮.
- Texto del post, imagen grande con mute.
- "11:02 p. m. · 17 oct. 26 · **21.8K** Visualizaciones".
- Barra de acciones.
- Composer fijo abajo con "Postea tu respuesta".

## WhatsApp Image 2022131231236-10-18 at 5.58.25 PM.jpeg — Editar perfil
- Header: ← | "**Editar perfil**" | "**Guardar**" azul a la derecha.
- Banner con botón cámara centrado (círculo negro semitransparente con 📷).
- Avatar 112px solapado con botón cámara centrado.
- Campos (label flotante arriba en gris 13px, valor 17px blanco, divisor inferior):
  - "Nombre" / "Dreftian"
  - "Biografía" / texto multilínea
  - "Ubicación" / "Perú - Lima"
  - "Sitio web" / (vacío)
  - "Fecha de nacimiento" / "marzo 23, 1998" + subtexto gris "Mes y día: Tus seguidores / Año: Solo tú"

## WhatsApp Image 202333346-10-18 at 5.58.27 PM.jpeg — País
- Header ← | "País" + "@Dreftian".
- Píldora de búsqueda "Buscar países".
- Lista alfabética de países (Afganistán, Albania, Alemania, Andorra, Angola, Anguila, Antigua y Barbuda, Antártida, Arabia Saudita, Argelia, Argentina, Armenia...), cada uno en fila con divisor, 17px.

## WhatsApp Image 2026-10-18 at 5.54448.28 PM.jpeg — Delega
- Header ← | "Delega".
- Párrafo gris "Compartir una cuenta con personas que tienen roles delegados."
- Fila con toggle a la derecha (activado, gris/blanco): "**Permitir que otros te inviten a su cuenta**" + párrafo gris con "Más información" azul.
- Sección "**Tus delegaciones**".
- Filas con chevron ›: "Cuentas que te han delegado", "Miembros en los que has delegado".

## WhatsApp Image 2026-10-18 at 5.58.26 21312PM.jpeg — Bienvenida a Comunidades
- Hoja modal (drag handle arriba).
- Título centrado 28px extrabold, 2 líneas: "Te damos la bienvenida a Comunidades".
- Párrafo centrado gris: "Las Comunidades son grupos de conversación moderados, donde las personas en X pueden conectarse y compartir."
- 3 filas con icono a la izquierda y título bold + descripción gris:
  - ✨ **Conoce a otras personas con tus mismos intereses** — "Únete a Comunidades para conectarte con personas que comparten tus intereses."
  - 👥 **Postea directamente en una Comunidad** — "Tus posts se comparten con los miembros de la Comunidad y con tus seguidores."
  - 🤍 **Obtén respaldo cuando lo necesites** — "Los admins y los moderadores ayudan a mantener las Comunidades seguras y las conversaciones en regla."
- Botón blanco ancho, radio full, abajo: "**Consultar**".

## WhatsApp Image 2026-11234123120-18 at 5.58.27 PM.jpeg — Nombre de usuario
- Header ← | "Nombre de usuario" + "@Dreftian".
- Campo con label flotante "Actual" (borde #2f3336, texto "@Dreftian" gris atenuado).
- Campo con label flotante "Nuevo" (borde azul 2px), icono @ + "Dreftian".
- Botón azul píldora abajo a la derecha: "**Listo**".

## WhatsApp Image 2026-155340-18 at66 5.58.29 PM.jpeg — Post (Daruma)
- Header: ← | "Post" | 🕊️.
- Autor: avatar 48px, "**Daruma**" + "@pkzz98l", botón blanco "Seguir", ⋮.
- Texto: "genio total ojala verlo en mas series junto todo el team".
- "11:15 p. m. · 17 oct. 26 · **815** Visualizaciones".
- Acciones: 💬1 🔁18 ❤️18 🔖1 ↗.
- Respuestas en hilo con línea conectora.
- Composer fijo abajo.

## WhatsApp Image 551242026-10-18 at 5.58.28 PM.jpeg — Seguridad (scrolled)
- Misma pantalla que 224.jpeg desplazada. Se ven: párrafo de 2FA, "Autenticación en dos fases", "Verificación de documento de identidad" + párrafo, "Protección con contraseña adicional", "Protección de restablecimiento de contraseña" + toggle, "Administrar claves de acceso" + párrafo con "Más información".

## WhatsApp Image12122 2026-10-18 at 5.58.29 PM.jpeg — Perfil de otro usuario
- Banner gris (sin imagen) con 4 círculos: ← | 🕊️ 🔍 ⋯.
- Avatar 80px solapado (sin borde de color), botón circular "↗" (compartir) a la derecha.
- "**Daruma**" 20px extrabold (sin candado), "@pkzz98l" gris.
- "🕊️ Mostrar traducción" (azul).
- Bio: "T".
- "📅 Se unió en febrero 2025 ›".
- "**13** Siguiendo  **1** Seguidor".
- Dos botones outline radio full: "**Mensaje**" | "**Seguir**" (el segundo blanco relleno).
- Pestañas: 📄 "Posts" (activa) | 💬 | 🔁 | 🎬.
- "**A quién seguir**" 20px extrabold + carrusel horizontal de tarjetas (banner + avatar + nombre "Asuna Matoi" + botón "Seguir").
- FAB azul +.

---

# GAPS detectados en el código actual

## src/components/Header.tsx
- [ ] Falta la píldora azul "✅ Actualizar a nivel…" a la derecha del logo en el header de home (refs 123123123.jpeg, 5.58.20 PM).
- [ ] La 3ª pestaña actual es "Extalmita 🌐"; las refs muestran "Bebés 💖✨" y una pestaña "+" para añadir/editar pestañas. Mantener "Extalmita" es válido como marca propia, pero debe añadirse la pestaña "+".
- [ ] Las pestañas de home deben incluir chevron ⌄ en la activa ("Para ti ⌄").

## src/components/ExploreView.tsx
- [ ] Las pestañas deben empezar por "Explorar" (activa por defecto), no "Para ti".
- [ ] Quitar el banner destacado con imagen grande; en la ref la lista de tendencias va directa.
- [ ] Encabezado de sección: la ref no muestra "Tendencias para ti" como título grande; muestra directamente las filas con "Tendencia en Perú" / "Deportes · Tendencia" arriba y el término en bold. El contador de posts no aparece en la ref.
- [ ] Orden del header: avatar | búsqueda | engranaje (ya está bien).

## src/components/NotificationsView.tsx
- [ ] Rehacer las filas: icono pequeño (destello morado / persona azul) a la izquierda, luego avatar 40px, luego texto con formato "Post reciente de **Nombre** · 1 s" + preview gris, o "**Nombre** te siguió · 1 s".
- [ ] Añadir "⋮" a la derecha de cada fila.
- [ ] Pestaña activa debe llevar icono de campana ("🔔 Todas").
- [ ] Los datos actuales son mensajes de sistema; reemplazar por notificaciones con actor real (post reciente / follow).

## src/components/ProfileView.tsx
- [ ] Overlay del banner: debe haber 4 círculos negros semitransparentes — ← a la izquierda; 🕊️ (fantasma), 🔍 (lupa), ⋯ (menú) a la derecha. Hoy solo hay ← y compartir.
- [ ] Candado 🔒 junto al nombre si la cuenta es protegida (añadir campo opcional `is_protected` al tipo o derivar).
- [ ] Píldora "✅ Obtener verificación" junto al nombre en el perfil propio.
- [ ] Metadatos: añadir "🎂 Fecha de nacimiento: …" junto a la ubicación.
- [ ] "Se unió en …" debe llevar chevron ›.
- [ ] Menú ⋯ del banner con "Borradores" y "Listas en las que estás".
- [ ] Pestañas: deben ser iconos que se expanden con label al activarse (ya está) pero la barra activa debe ser BLANCA, no azul, y en el perfil la activa lleva chevron ⌄.
- [ ] Añadir estados vacíos por pestaña:
  - Videos: "Luz, cámara... ¡adjuntos!" + "Tus posts de video aparecerán aquí."
  - Artículos: "Escribe artículos en X" (→ Talma) + párrafo + botón azul "Suscríbete a Premium".
  - Respuestas / Me gusta: contenido o estado vacío equivalente.
- [ ] Contexto de repost: "🔁 Tú reposteaste" encima del post cuando corresponda.
- [ ] En perfil ajeno: botón "Mensaje" (outline) + "Seguir" (blanco relleno) — hoy solo hay Seguir/Editar.
- [ ] "🕊️ Mostrar traducción" en azul bajo el handle cuando el post no está en español (opcional/simulado).
- [ ] Sección "**A quién seguir**" con carrusel horizontal de tarjetas al final del perfil.

## src/components/MobileDrawer.tsx
- [ ] Orden y etiquetas exactas: Perfil, Premium (con píldora "50% de descuento"), Comunidades, Guardados, Listas, **Espacios**, Solicitudes de seguimiento, Estudio para creadores.
- [ ] Falta el ítem "Espacios".
- [ ] Falta la píldora "50% de descuento" en Premium.
- [ ] "Solicitudes" debe ser "Solicitudes de seguimiento" (texto completo).
- [ ] Añadir "Abrir Grok" equivalente (p.ej. "Abrir Talma AI") en el bloque de iconos pequeños.
- [ ] Los ítems del bloque inferior deben ser icono 18px + label 15px NORMAL (no bold).
- [ ] Candado junto al nombre si la cuenta es protegida.

## src/components/SettingsView.tsx
- [ ] Añadir sección "**Intercambio y personalización de datos**" al final de Privacidad y seguridad (ref asdad.jpeg).
- [ ] Verificar que "Administrar claves de acceso" esté en Seguridad (existe en línea ~934).
- [ ] En Preferencias de notificaciones usar toggles (switch) en lugar de checkboxes, según estilo X.

## src/components/CommunitiesModal.tsx
- [ ] Falta la pantalla de bienvenida "Te damos la bienvenida a Comunidades" con 3 bullets y botón "Consultar" (ref 5.58.26 21312PM.jpeg). Debe mostrarse la primera vez y poder reabrirse.

## src/components/TweetDetailModal.tsx
- [ ] Añadir contexto de repost "🔁 Tú reposteaste" si aplica.
- [ ] Botón "Seguir" en blanco relleno a la derecha del autor (ya está, verificar estilo).
- [ ] Composer fijo al fondo con iconos 📷 🎞️ GIF y ⛶ expandir.
- [ ] Línea conectora vertical entre el post y las respuestas.
- [ ] Falta pantalla dedicada de respuesta (ref Ima222334ge): ✕ + botón azul "Responder", post original resumido, "Respondiendo a @a y a @b", avatar + "Publicar tu respuesta", barra de 7 iconos abajo.

## src/components/EditProfileModal.tsx
- [ ] Añadir campo "Fecha de nacimiento" visible con subtexto "Mes y día: Tus seguidores / Año: Solo tú".
- [ ] Header móvil: ← | "Editar perfil" | "Guardar" azul a la derecha (ya existe, verificar que en móvil use ← y no ✕).
- [ ] Estilo de campos: label flotante arriba en gris, valor debajo, divisor inferior (no cajas con borde).

## src/App.tsx
- [ ] Barra inferior: 5 iconos (Inicio, Buscar, Grok/TalmaAI, Notificaciones, Mensajes) — falta el icono central tipo "Grok" entre Buscar y Notificaciones (refs muestran 5 iconos incluyendo el destello/Grok).
- [ ] Los badges de notificación (2) y mensajes (1) deben ser dinámicos, no hardcodeados.
- [ ] El FAB debe ocultarse en perfil? (En refs aparece también en perfil, así que se mantiene.)
---

# Estado de implementación (actualizado)

Todas las referencias de `C:\Users\Dreitz\Desktop\xd` quedaron implementadas en la web móvil de Talma.
Verificado con Playwright (390x844, Chrome real) contra `npm run dev`; capturas en `.shots\`.
`npx tsc --noEmit` → 0 errores; `npm run build` → OK (1947 módulos).

## Cerrado por archivo

- **src/components/Header.tsx** — píldora azul "✓ Actualizar a nivel…" con truncado; chevron ⌄ en la pestaña activa; pestaña "+" con popover "Pestañas de inicio" + "Restablecer pestañas"; logo centrado absoluto.
- **src/App.tsx** — bottom nav de 5 iconos (Inicio, Explorar, **Talma AI**, Notificaciones, Mensajes) con bottom sheet de Talma AI; badges dinámicos (mensajes desde `unread_count`, notificaciones solo si >0, "9+" por encima de 9); FAB oculto en mensajes, ajustes y detalle de post.
- **src/components/ExploreView.tsx** — reescrito: pestaña inicial "Explorar", sin banner destacado, filas 13px categoría + 15px bold término + ⋮, scroll horizontal sin scrollbar.
- **src/components/NotificationsView.tsx** — filas icono-de-tipo (destello morado / persona azul) + avatar 40px + "Post reciente de **Nombre** · 1 s" con preview 2 líneas + ⋮; pestaña "Todas" con campana; datos sembrados tipo 2.jpeg.
- **src/components/ProfileView.tsx** — overlay de 4 círculos; candado de cuenta protegida; píldora "Obtener verificación"; "🎂 Fecha de nacimiento"; chevron en "Se unió"; menú ⋯ (Borradores / Listas en las que estás); pestañas icono→label con barra **blanca** y chevron, orden Posts/Respuestas/Reposts/Videos/Artículos/Me gusta; estados vacíos por pestaña; "🔁 Tú reposteaste"; "Mensaje" en perfil ajeno; "Mostrar traducción"; carrusel "A quién seguir".
- **src/components/MobileDrawer.tsx** — Perfil, Premium + píldora "50% de descuento", Comunidades, Guardados, Listas, **Espacios**, Solicitudes de seguimiento, Estudio para creadores; bloque inferior con iconos 18px y label normal; "Abrir Talma AI".
- **src/components/SettingsView.tsx** — nueva sección "Intercambio y personalización de datos"; componente `ToggleSwitch` reemplaza los checkboxes; pantalla SMS "Te enviamos un código" con input único y botón deshabilitado.
- **src/components/EditProfileModal.tsx** — "Guardar" en píldora azul; campos con label flotante + divisor; campo "Fecha de nacimiento" con subtexto "Mes y día: Tus seguidores / Año: Solo tú".
- **src/components/TweetDetailModal.tsx** — contexto de repost; composer fijo con iconos; línea conectora del hilo; pantalla dedicada de respuesta (✕ + "Responder" + "Publicando tu respuesta" + barra de 7 iconos).
- **src/components/CommunitiesModal.tsx** — bienvenida "Te damos la bienvenida a Comunidades" con 3 bullets y botón "Consultar".
- **src/components/MessagesView.tsx** — fila de chat: avatar 56px, nombre 17px bold + check, hora 13px, preview 15px truncado.
- **src/components/TweetCard.tsx** — prop `repostContext` ("🔁 Tú reposteaste"), botón Ghost de Talma AI junto a ⋮.

## Correcciones de filtrado (pestañas del perfil)

En `src/components/ProfileView.tsx` el filtro `displayedPosts` no distinguía video de imagen y no tenía caso para reposts. Ahora:

```ts
case 'media':
  // Ref 12.jpeg: la pestaña "Videos" solo lista posts con video (no imágenes ni audio)
  return Boolean(post.media && post.media.some((m) => m.type === 'video'));
case 'highlights':
  // Ref 9.jpeg: la pestaña "Reposts" lista lo que el usuario ha reposteado
  return Boolean(post.is_reposted);
```

## Limitaciones conocidas (por datos, no por UI)

- **Notificaciones**: la API no expone endpoint de notificaciones, así que `NotificationsView` usa datos sembrados (`SEEDED_NOTIFICATIONS`).
- **Badge de notificaciones**: sin contador en la API, solo aparece si hay valor > 0.
- **"A quién seguir"**: el carrusel existe pero solo se pinta si `fetchRecommendations` devuelve usuarios; la BD de desarrollo solo tiene `admin`.
- **Interacciones nuevas** (píldora Premium, Espacios, claves de acceso, delegación): son de maqueta, sin backend.
