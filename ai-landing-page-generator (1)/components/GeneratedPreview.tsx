import React, { useState } from 'react';
import { ClipboardDocumentCheckIcon, ArrowPathIcon, LinkIcon } from './icons';

interface GeneratedPreviewProps {
  htmlContent: string;
  pageUrl: string;
  onReset: () => void;
}

const GeneratedPreview: React.FC<GeneratedPreviewProps> = ({ htmlContent, pageUrl, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full aspect-video bg-gray-100 rounded-lg shadow-inner border border-gray-200 overflow-hidden">
        <iframe
          src={pageUrl}
          title="Vista Previa de la Landing Page"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
      <div className="w-full space-y-4">
        <div className="relative">
          <LinkIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            type="text"
            readOnly
            value="URL de vista previa (válida en esta sesión)"
            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-4 text-sm text-gray-700 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <ClipboardDocumentCheckIcon className="w-5 h-5" />
              {copied ? '¡URL Copiada!' : 'Copiar URL'}
            </button>
             <button
              onClick={onReset}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Crear Otra
            </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedPreview;