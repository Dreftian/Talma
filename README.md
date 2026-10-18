# Talma ⚡

Talma es una red social full-stack inspirada al 100% en el diseño, fluidez y experiencia de usuario de **X (anteriormente Twitter)**, completamente integrada con **Supabase** para el almacenamiento de archivos multimedia (fotos, videos, notas de audio, GIFs, avatares y banners) y base de datos.

![Talma Preview](public/logo-talma.png)

---

## 🚀 Características Principales

### 🎨 Frontend Idéntico a "X" (Twitter)
- **Tema Oscuro Puro (`#000000`)**: Paleta de colores exacta de X con bordes `#2f3336`, tarjetas sutiles `#16181c` y texto `#e7e9ea`.
- **Identidad de Marca Talma**:
  - Logo oficial estilizado con la barra verde vibrante superior en la "T".
  - Tipografía y espaciados pixel-perfect.
- **Diseño de 3 Columnas**:
  1. **Barra Lateral Izquierda (Navegación)**:
     - Logo Talma interactivo
     - Enlaces: Inicio, Explorar, Notificaciones (con badges), Mensajes, Guardados, Perfil y Configuración
     - Botón principal de **"Postear"** con modal flotante
     - Tarjeta de usuario con menú de cambio de cuenta y cierre de sesión
  2. **Columna Central (Flujo principal)**:
     - Header sticky con pestañas **"Para ti"** y **"Siguiendo"**
     - **Compositor de Tweets**:
       - Carga en tiempo real a Supabase Storage con barra de estado
       - Soporte para fotos (PNG, JPG, WebP), videos (MP4, WebM) y notas de audio (MP3, WAV)
       - Creador de encuestas interactivas
       - Contador circular de caracteres (límite 280)
     - **Feed de Publicaciones**:
       - Malla de imágenes (1, 2, 3 o 4 imágenes con Lightbox en pantalla completa)
       - Reproductor de video nativo
       - Reproductor de audio personalizado con visualización de onda (waveform) y barra de reproducción
       - Encuestas interactivas con cálculo instantáneo de porcentajes
       - Botones de acción: Responder, Repostear (verde), Me gusta (animación corazón rosa), Visualizaciones, Guardar y Compartir (copia enlace al portapapeles)
     - **Vista de Detalle de Post**:
       - Hilo de respuestas en tiempo real y métricas extendidas
     - **Mensajes Directos (DMs / Chat)**:
       - Lista de conversaciones y ventana de chat en tiempo real
       - Envío de mensajes con archivos multimedia adjuntos
     - **Perfil de Usuario**:
       - Banner, avatar con borde circular, biografía, ubicación, sitio web y fecha de registro
       - Modal para editar perfil subiendo banner y avatar directamente a Supabase Storage
  3. **Barra Lateral Derecha**:
     - Buscador sticky con filtro en tiempo real
     - Tarjeta de suscripción "Talma Premium"
     - Sección "Qué está pasando" (Trending topics con categorías y conteos)
     - Sección "A quién seguir" (Recomendaciones de cuentas con botón Seguir/Siguiendo)
     - Enlaces legales de pie de página

---

## 🐘 Integración con Supabase

### 1. Variables de Entorno (`.env`)
```env
SUPABASE_URL=https://wmrvhihrwskuzoiifaug.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_uz1mjpwpV8t1QBtS4Fwj4Q_1qGF-KZB
SUPABASE_SECRET_KEY=tu_supabase_secret_key_aqui
SUPABASE_JWKS_URL=https://wmrvhihrwskuzoiifaug.supabase.co/auth/v1/.well-known/jwks.json
```

### 2. Supabase Storage (`talma-media`)
- Todas las imágenes, fotos de perfil, banners, audios y videos subidos por los usuarios se almacenan en el bucket público `talma-media`.
- La URL pública se genera automáticamente:  
  `${SUPABASE_URL}/storage/v1/object/public/talma-media/...`

### 3. Base de Datos en Supabase
El archivo [supabase/schema.sql](supabase/schema.sql) contiene el esquema completo para ejecutar en el **SQL Editor de Supabase**:
- Tablas: `profiles`, `posts`, `likes`, `reposts`, `bookmarks`, `follows`, `messages`, `notifications`
- Políticas Row Level Security (RLS)
- Índices para alto rendimiento
- Disparadores automáticos de recuento

*Nota: La aplicación cuenta con un adaptador dual automático. Si la base de datos de Supabase aún no tiene las tablas creadas, el backend utiliza la persistencia local en `data/talma_db.json` mientras continúa subiendo y sirviendo todo el contenido multimedia directamente desde Supabase Storage.*

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React Icons, Canvas Confetti
- **Backend**: Node.js, Hono, `@supabase/server` (`@supabase/server/core`), `@supabase/supabase-js`
- **Herramientas**: Vite 8, TSX, Concurrently

---

## 💻 Instrucciones para Ejecutar

### 1. Instalar dependencias
```bash
npm install
```

### 2. Modo Desarrollo (Servidor Backend + Frontend Vite)
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001` (con proxy automático desde Vite)

### 3. Modo Producción
```bash
npm run build
npm start
```
El servidor Hono compila y sirve tanto la API como la aplicación web en `http://localhost:3001`.

---

© 2026 Talma. Todos los derechos reservados.
