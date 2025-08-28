import React, { useState } from 'react';
import type { BusinessFormData } from '../types';
import { INDUSTRIES } from '../constants';
import { PaperAirplaneIcon, PhotoIcon, XCircleIcon } from './icons';

interface BusinessFormProps {
  onSubmit: (data: BusinessFormData) => void;
  isLoading: boolean;
}

const BusinessForm: React.FC<BusinessFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    industry: INDUSTRIES[0],
    description: '',
    sells: '',
    phone: '',
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 2); // Limitar a 2 archivos
      const newPreviews: string[] = [];
      const newImages: string[] = [];

      files.forEach(file => {
        newPreviews.push(URL.createObjectURL(file));
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setFormData(prev => ({ ...prev, images: newImages }));
          }
        };
        reader.readAsDataURL(file);
      });
      setImagePreviews(newPreviews);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    const newImages = [...(formData.images || [])];

    URL.revokeObjectURL(newPreviews[index]); // Limpiar memoria
    newPreviews.splice(index, 1);
    newImages.splice(index, 1);
    
    setImagePreviews(newPreviews);
    setFormData(prev => ({...prev, images: newImages}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const isFormValid = formData.name && formData.description && formData.sells;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de tu Negocio
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Ej: Cafetería El Sol"
        />
      </div>

      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
          Industria
        </label>
        <select
          id="industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>
      
       <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
          Sube tus propias imágenes (Opcional)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Sube hasta 2 archivos</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
            </div>
        </div>
         {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative">
                  <img src={src} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                  <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-white rounded-full p-0.5">
                    <XCircleIcon className="w-6 h-6 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ))}
            </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Describe tu negocio
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Ej: Somos una cafetería familiar que ofrece café de especialidad y postres caseros en un ambiente acogedor."
        ></textarea>
      </div>

      <div>
        <label htmlFor="sells" className="block text-sm font-medium text-gray-700 mb-1">
          ¿Qué vendes? (Productos o Servicios)
        </label>
        <textarea
          id="sells"
          name="sells"
          value={formData.sells}
          onChange={handleChange}
          rows={3}
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Ej: Café espresso, lattes, capuccinos, pasteles, galletas, sándwiches."
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Número de WhatsApp (Opcional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Ej: 5215512345678 (incluye código de país)"
        />
        <p className="text-xs text-gray-500 mt-1">Para el botón de contacto directo.</p>
      </div>

      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
      >
        <PaperAirplaneIcon className="w-5 h-5" />
        {isLoading ? 'Generando...' : 'Crear mi Página Web'}
      </button>
    </form>
  );
};

export default BusinessForm;