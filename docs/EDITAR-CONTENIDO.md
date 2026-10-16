# Cómo editar el contenido del sitio

Esta guía explica cómo actualizar el contenido de mastropietro.com.ar sin tocar código, usando
el panel de administración Keystatic.

## 1. Ingresar al panel

1. Andá a `https://mastropietro.com.ar/keystatic`.
2. Iniciá sesión con tu cuenta de GitHub (es la misma cuenta con la que te dieron acceso al
   repositorio del sitio).
3. Vas a ver un menú a la izquierda con las colecciones (Iconos, Categorías, Obras) y las páginas
   únicas (Página de inicio, Configuración del sitio, Página de Software).

## 2. Agregar una obra nueva

1. En el menú, entrá a **Obras**.
2. Hacé clic en **Add** (arriba a la derecha).
3. Completá los campos:
   - **Título**: nombre de la obra. El slug (la dirección web de la obra) se genera solo a
     partir del título, no hace falta tocarlo.
   - **Año**: año de la obra, solo el número.
   - **Cliente**: nombre del cliente o estudio.
   - **Superficie (m²)**: opcional, solo si tenés el dato.
   - **Ubicación**: localidad o barrio, por ejemplo "San Isidro" o "Puertos del Lago, Escobar".
     Opcional.
   - **Categorías**: elegí una o más categorías de la lista. Si la que necesitás no existe,
     creala primero (ver sección 4).
   - **Descripción**: texto libre, podés dejar una línea en blanco entre párrafos para separar
     ideas.
   - **Portada**: la foto principal de la obra (ver tamaño recomendado abajo). Es obligatoria.
   - **Galería**: fotos adicionales, opcional. Se pueden agregar varias.
   - **Destacada en inicio**: activá esta opción solo si querés que la obra aparezca en la
     sección "Obras destacadas" de la página de inicio.
   - **Orden**: solo importa si la obra está marcada como destacada; define en qué posición
     aparece entre las destacadas (número más bajo aparece primero).
4. Hacé clic en **Save** (o **Create**) arriba a la derecha.
5. El cambio queda guardado. Según cómo esté configurado el sitio, puede guardarse directo o
   crear un pedido de cambio para revisar antes de publicar (ver sección 8).

## 3. Tamaño de foto recomendado

- Horizontal (apaisada), no vertical.
- Al menos 1600 píxeles de ancho.
- Formato JPG o WebP.
- No hace falta redimensionar ni comprimir antes de subirla: el sitio la optimiza
  automáticamente al publicarse (genera varios tamaños y el formato más liviano posible).

## 4. Agregar una categoría nueva

1. En el menú, entrá a **Categorías**.
2. Hacé clic en **Add**.
3. Completá:
   - **Nombre**: nombre interno de la categoría, por ejemplo "Barrios privados".
   - **Etiqueta**: el texto que se va a mostrar en los filtros y chips de la sección Obras.
4. Guardá. La categoría ya va a estar disponible para elegir en el campo Categorías de cualquier
   obra.

## 5. Editar los textos de la página de inicio

1. En el menú, entrá a **Página de inicio**.
2. **Encabezado**: ahí está el título del hero (la frase grande de arriba), la bajada (frase
   corta debajo) y la obra destacada en el hero (elegí cualquier obra de la lista; su foto y
   datos se usan automáticamente para ilustrar el hero).
3. Más abajo están las **Secciones** del resto de la página (Diferenciales, Servicios,
   Curriculum, Publicaciones, Política de Calidad, Clientes, etc.). Cada una se puede editar por
   separado: títulos, textos, tarjetas, imágenes.
4. Guardá los cambios con **Save** arriba a la derecha.

## 6. Editar los datos de contacto

1. En el menú, entrá a **Configuración del sitio**.
2. En **Contacto** vas a encontrar teléfono, WhatsApp, correo electrónico, dirección y la
   ubicación del mapa (latitud y longitud).
3. También hay una sección de **Redes y enlaces externos** (YouTube, el libro en Mercado Libre) y
   el pie de página.
4. Guardá los cambios.

## 7. Editar la página de Software

1. En el menú, entrá a **Página de Software**.
2. Ahí se edita la introducción, las características destacadas, el texto de "a quién está
   dirigido", la captura de pantalla, la versión del programa, el enlace de descarga del
   instalador y los textos del formulario de descarga.
3. Guardá los cambios.

## 8. Cuánto tarda en verse el cambio

Después de guardar en `/keystatic`, el sitio vuelve a construirse automáticamente. El cambio
suele quedar visible en la web en unos minutos. Si pasan más de 15 o 20 minutos y no ves el
cambio reflejado, avisá para revisar si la construcción del sitio tuvo algún problema.

## 9. Qué no tocar

- No cambies el **slug** de una obra una vez creada (la dirección web de esa obra), salvo que
  sepas que querés que cambie: si alguien ya tiene guardado o compartido el enlace viejo, deja de
  funcionar.
- No borres categorías que estén en uso por alguna obra sin antes quitarlas de esas obras.
- La colección **Iconos** es una lista técnica de íconos disponibles para las tarjetas; no hace
  falta tocarla para el uso normal del sitio.
