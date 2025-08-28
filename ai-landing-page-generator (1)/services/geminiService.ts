import { GoogleGenAI, Modality } from "@google/genai";
import type { BusinessFormData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const generateImageWithImageInput = async (formData: BusinessFormData): Promise<string> => {
    const imageParts = formData.images!.map(imgBase64 => {
        const [header, data] = imgBase64.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        return { inlineData: { data, mimeType } };
    });
    
    const prompt = `
      Basado en la información del negocio e inspirado en la(s) imágen(es) proporcionada(s), genera una única imagen ilustrativa nueva, profesional y estéticamente agradable para su landing page.
      - Nombre del negocio: ${formData.name}
      - Industria: ${formData.industry}
      - Descripción: ${formData.description}
      La nueva imagen debe capturar la esencia del negocio (ej. un logo, una imagen de cabecera, una ilustración).
      Debe ser una creación artística única, no una simple edición de las fotos.
      Estilo: moderno, limpio, vibrante, que inspire confianza. No incluyas texto en la imagen.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                ...imageParts,
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error("No se pudo generar la imagen a partir de la entrada.");
};

const generateImageWithTextInput = async (formData: BusinessFormData): Promise<string> => {
    const prompt = `
      Genera una imagen profesional y estéticamente agradable para una landing page. 
      - Nombre del negocio: ${formData.name}
      - Industria: ${formData.industry}
      - Descripción: ${formData.description}
      - Vende: ${formData.sells}
      La imagen debe ser moderna, limpia, vibrante y debe evocar confianza y calidad. 
      Debe ser una ilustración o una fotografía de alta calidad que represente la esencia del negocio. 
      Evita incluir texto en la imagen.
      Estilo visual: minimalista, profesional, atractivo. Aspect Ratio 16:9.
    `;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    
    throw new Error("No se pudo generar la imagen.");
};


export const generateIllustrativeImage = async (
  formData: BusinessFormData
): Promise<string> => {
    if (formData.images && formData.images.length > 0) {
        return generateImageWithImageInput(formData);
    } else {
        return generateImageWithTextInput(formData);
    }
};

export const generateLandingPageHtml = async (
  formData: BusinessFormData
): Promise<string> => {
  const ctaButtonHtml = formData.phone
    ? `
    <a href="https://wa.me/${formData.phone.replace(/\D/g, '')}?text=Hola%20estoy%20interesado%20(a)%20en%20tus%20servicios" target="_blank" class="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition duration-300 text-lg shadow-lg">
      Contáctanos en WhatsApp
    </a>`
    : '';

  const prompt = `
    Eres un experto desarrollador frontend y diseñador UX/UI. Tu tarea es generar el código HTML completo para una landing page moderna y profesional de una sola página.
    Utiliza Tailwind CSS para todo el estilizado. El diseño debe ser limpio, atractivo y totalmente responsive.
    La página debe estar en español.

    Aquí está la información del negocio:
    - Nombre del negocio: ${formData.name}
    - Industria: ${formData.industry}
    - Descripción detallada: ${formData.description}
    - Productos/Servicios que vende: ${formData.sells}
    ${formData.images && formData.images.length > 0 ? "- El usuario ha proporcionado imágenes de su negocio como inspiración, tenlo en cuenta para que el texto sea coherente con un estilo visual más personalizado." : ""}

    La estructura de la página debe incluir:
    1.  Un 'Hero Section' con un titular atractivo, un subtítulo y un placeholder para la imagen principal. La imagen se insertará aquí: <img src="IMAGE_PLACEHOLDER" alt="Imagen principal del negocio" class="w-full h-full object-cover rounded-xl shadow-2xl">
    2.  Una sección 'Sobre Nosotros' que use la descripción del negocio.
    3.  Una sección de 'Productos/Servicios' que liste lo que vende el negocio de forma clara.
    4.  Una sección de 'Llamada a la Acción' (CTA) que incluya el siguiente botón si se proporcionó un número de teléfono: ${ctaButtonHtml ? 'Sí, incluye el botón de WhatsApp.' : 'No se proporcionó número, crea un CTA genérico.'}
    5.  Un pie de página simple con el nombre del negocio y el año actual.

    Requerimientos importantes:
    - TODO el código debe estar dentro de un único bloque HTML.
    - Empieza con \`<!DOCTYPE html>\` y termina con \`</html>\`.
    - Incluye el script de Tailwind CSS en el \`<head>\`.
    - Utiliza una paleta de colores profesional y fuentes legibles (ej. de Google Fonts).
    - El contenido debe ser persuasivo y estar bien redactado en español, basado en la información proporcionada.
    - NO incluyas ninguna explicación, comentarios de código (excepto el placeholder de la imagen si es necesario), ni nada que no sea el código HTML puro.

    Este es el código del botón de WhatsApp para que lo insertes en la sección de CTA (si aplica):
    ${ctaButtonHtml}

    Ahora, genera el código HTML completo.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  // Clean up the response to ensure it's valid HTML
  let htmlResponse = response.text;
  if (htmlResponse.startsWith('```html')) {
    htmlResponse = htmlResponse.substring(7);
  }
  if (htmlResponse.endsWith('```')) {
    htmlResponse = htmlResponse.slice(0, -3);
  }
  
  return htmlResponse.trim();
};