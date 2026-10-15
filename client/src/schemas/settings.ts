import { fields, singleton } from "@keystatic/core";

export const settingsSchema = singleton({
  label: "Configuración del sitio",
  path: "src/content/globals/settings/",
  schema: {
    contacto: fields.object(
      {
        telefonoTexto: fields.text({
          label: "Teléfono (texto visible)",
          description: 'Ej: "(+54) 9 11 4157-6009"',
        }),
        telefonoNumero: fields.text({
          label: "Teléfono (número para el enlace tel:)",
          description: 'Ej: "+5491141576009"',
        }),
        whatsappNumero: fields.text({
          label: "WhatsApp (número para wa.me)",
          description: 'Ej: "5491141576009", sin signos ni espacios.',
        }),
        email: fields.text({ label: "Correo electrónico" }),
        direccionTexto: fields.text({
          label: "Dirección (texto visible)",
        }),
        mapaLat: fields.number({ label: "Latitud del mapa" }),
        mapaLng: fields.number({ label: "Longitud del mapa" }),
        formularioDestino: fields.text({
          label: "Correo de destino del formulario de contacto",
          description: "A dónde llegan los mensajes del formulario (formsubmit.co).",
        }),
      },
      { label: "Contacto" },
    ),

    redes: fields.object(
      {
        youtubeUrl: fields.text({ label: "URL del canal de YouTube" }),
        libroMercadoLibreUrl: fields.text({
          label: "URL del libro en Mercado Libre",
        }),
      },
      { label: "Redes y enlaces externos" },
    ),

    footer: fields.object(
      {
        telefonoTexto: fields.text({
          label: "Texto sobre el teléfono",
          description: "Frase corta antes del botón de llamar/WhatsApp.",
        }),
        emailTexto: fields.text({
          label: "Texto sobre el correo",
          description: "Frase corta antes del enlace de correo.",
        }),
        copyright: fields.text({
          label: "Texto de derechos de autor",
          description: 'Usa "{year}" para el año actual, se reemplaza automáticamente.',
        }),
      },
      { label: "Pie de página" },
    ),

    seo: fields.object(
      {
        descripcionPorDefecto: fields.text({
          label: "Descripción por defecto (SEO)",
          multiline: true,
        }),
        googleSiteVerification: fields.text({
          label: "Código de verificación de Google Search Console",
        }),
      },
      { label: "SEO" },
    ),

    gtmId: fields.text({
      label: "ID de Google Tag Manager",
      description: 'Ej: "GTM-PN23B6M8"',
    }),
  },
});
