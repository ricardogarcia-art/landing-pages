import React, { useState, useCallback, useEffect } from 'react';
import type { BusinessFormData } from './types';
import BusinessForm from './components/BusinessForm';
import LoadingIndicator from './components/LoadingIndicator';
import GeneratedPreview from './components/GeneratedPreview';
import { generateIllustrativeImage, generateLandingPageHtml } from './services/geminiService';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [formData, setFormData] = useState<BusinessFormData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [pageUrl, setPageUrl] = useState<string>('');
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    // Cleanup function para revocar la URL del objeto cuando el componente se desmonte o la URL cambie
    return () => {
      if (pageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pageUrl);
      }
    };
  }, [pageUrl]);

  const handleFormSubmit = useCallback(async (data: BusinessFormData) => {
    if (pageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pageUrl);
    }
    
    setFormData(data);
    setError('');
    setGeneratedImage('');
    setGeneratedHtml('');
    setPageUrl('');
    setIsLoadingImage(true);
    setIsLoadingPage(false);

    try {
      const imageB64 = await generateIllustrativeImage(data);
      const imageUrl = `data:image/png;base64,${imageB64}`;
      setGeneratedImage(imageUrl);
      setIsLoadingImage(false);
      setIsLoadingPage(true);

      const html = await generateLandingPageHtml(data);
      
      const finalHtml = html.replace(/IMAGE_PLACEHOLDER/g, imageUrl);
      setGeneratedHtml(finalHtml);

      const blob = new Blob([finalHtml], { type: 'text/html' });
      const objectUrl = URL.createObjectURL(blob);
      setPageUrl(objectUrl);

    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al generar el contenido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoadingImage(false);
      setIsLoadingPage(false);
    }
  }, [pageUrl]);
  
  const handleReset = () => {
    setFormData(null);
    setGeneratedImage('');
    setGeneratedHtml('');
    setPageUrl('');
    setError('');
    setIsLoadingImage(false);
    setIsLoadingPage(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-3">
            <SparklesIcon className="w-10 h-10 text-indigo-500" />
            <span>Creador de Landing Pages con IA</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Describe tu negocio, y nuestra IA diseñará una imagen única y una página web completa para ti en segundos.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">1. Cuéntanos sobre tu negocio</h2>
            <BusinessForm onSubmit={handleFormSubmit} isLoading={isLoadingImage || isLoadingPage} />
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 flex flex-col min-h-[500px]">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">2. Tu Página Generada</h2>
            <div className="flex-grow flex items-center justify-center">
              {isLoadingImage && <LoadingIndicator text="Creando una imagen ilustrativa única..." />}
              {isLoadingPage && <LoadingIndicator text="Construyendo tu landing page personalizada..." />}
              {error && <p className="text-red-500 text-center">{error}</p>}

              {!isLoadingImage && !isLoadingPage && !error && generatedHtml && (
                <GeneratedPreview htmlContent={generatedHtml} pageUrl={pageUrl} onReset={handleReset} />
              )}
               {!isLoadingImage && !isLoadingPage && !error && !generatedHtml && (
                <div className="text-center text-gray-500">
                  <p>La vista previa de tu página aparecerá aquí.</p>
                </div>
               )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;