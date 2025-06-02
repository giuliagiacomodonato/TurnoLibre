import Image from 'next/image';

interface VenueInfoProps {
  name: string;
  description: string;
  address: string;
  sports: string[];
  images: string[];
}

export function VenueInfo({ name, description, address, sports, images }: VenueInfoProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
      {/* Carrusel de imágenes */}
      <div className="relative h-64">
        <Image
          src={images[0]}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#426a5a] mb-2">{name}</h1>
        <p className="text-[#426a5a]/80 mb-4">{description}</p>
        
        <div className="flex items-center text-[#426a5a] mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{address}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {sports.map((sport) => (
            <span key={sport} className="px-3 py-1 bg-[#7fb685]/20 text-[#426a5a] rounded-full text-sm">
              {sport}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 