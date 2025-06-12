import { VenueLocation } from './VenueLocation';
import { VenueHours } from './VenueHours';
import { VenueServices } from './VenueServices';

interface VenueInfoProps {
  name: string;
  description: string;
  address: string;
  phone: string;
  sports: string[];
  images: string[];
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
  services: string[];
}

export function VenueInfo({ name, description, address, phone, sports, images, hours, services }: VenueInfoProps) {
  // Ordenar los horarios: lunes (1) a domingo (0 o 6), luego feriados
  const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Feriados'];
  const sortedHours = [...hours].sort((a, b) => {
    const idxA = diasOrden.indexOf(a.day);
    const idxB = diasOrden.indexOf(b.day);
    return idxA - idxB;
  });
  return (
    <div className="space-y-8">
      {/* Imágenes del complejo */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-[#426a5a] mb-4">Galería</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="aspect-video rounded-lg overflow-hidden">
              <img
                src={image}
                alt={`${name} - Imagen ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Componentes de ubicación, horarios y servicios */}
      <VenueLocation address={address} phone={phone} />
      <VenueHours hours={sortedHours} />
      <VenueServices services={services} />
    </div>
  );
} 