"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Toast } from "../../ui/Toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface PaginationInfo {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

interface Reservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
  facility: {
    name: string;
    sport: {
      name: string;
      id: string;
    };
  };
  payment: {
    amount: number;
    status: string;
  } | null;
}

interface Sport {
  id: string;
  name: string;
}

export default function VerReservas() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener filtros de la URL
  const deporteId = searchParams.get("deporte");
  const fechaParam = searchParams.get("fecha");
  const fecha = fechaParam || "";
  const hora = searchParams.get("hora") || "";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch('/api/sports');
        if (!response.ok) throw new Error('Error al cargar deportes');
        const data = await response.json();
        setSports(data);
      } catch (err) {
        console.error('Error fetching sports:', err);
      }
    };

    fetchSports();
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const params = new URLSearchParams();
        if (deporteId) params.set('deporte', deporteId);
        if (fechaParam) params.set('fecha', fechaParam);
        if (hora) params.set('hora', hora);
        params.set('page', page.toString());

        const response = await fetch(`/api/reservations?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Error al cargar las reservas');
        }
        const data = await response.json();
        setReservations(data.reservations);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [deporteId, fechaParam, hora, page]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/ver-reservas?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/ver-reservas?${params.toString()}`);
  };

  const filteredReservations = reservations.filter(reservation => 
    reservation.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.facility.sport.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando reservas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-[#426a5a]">Gestión de Reservas</h1>
      
      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deporte</label>
          <select
            className="w-full p-2 border rounded-md"
            value={deporteId || ""}
            onChange={(e) => handleFilterChange("deporte", e.target.value)}
          >
            <option value="">Todos los deportes</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            {fechaParam && (
              <button
                onClick={() => handleFilterChange("fecha", "")}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            )}
          </div>
          <input
            type="date"
            className="w-full p-2 border rounded-md"
            value={fecha}
            onChange={(e) => handleFilterChange("fecha", e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Hora</label>
            {hora && (
              <button
                onClick={() => handleFilterChange("hora", "")}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            )}
          </div>
          <select
            className="w-full p-2 border rounded-md"
            value={hora}
            onChange={(e) => handleFilterChange("hora", e.target.value)}
          >
            <option value="">Todas las horas</option>
            {Array.from({ length: 15 }, (_, i) => i + 8).map((hour) => (
              <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                {`${hour.toString().padStart(2, '0')}:00`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Buscar</label>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            )}
          </div>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="Buscar por nombre, cancha o deporte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Deporte</TableHead>
              <TableHead>Cancha</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Estado Pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.map((reservation) => {
              const timeZone = 'America/Argentina/Buenos_Aires';
              const localDate = toZonedTime(reservation.date, timeZone);
              const localStart = toZonedTime(reservation.startTime, timeZone);
              const localEnd = toZonedTime(reservation.endTime, timeZone);
              return (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.user.name}</TableCell>
                  <TableCell>{reservation.facility.sport.name}</TableCell>
                  <TableCell>{reservation.facility.name}</TableCell>
                  <TableCell>
                    {format(localDate, 'PPP', { locale: es })}
                  </TableCell>
                  <TableCell>
                    {format(localStart, 'HH:mm')} - {format(localEnd, 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      reservation.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800'
                        : reservation.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {reservation.payment
                      ? `$${reservation.payment.amount.toFixed(2)}`
                      : 'No pagado'}
                  </TableCell>
                  <TableCell>
                    {reservation.payment && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        reservation.payment.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : reservation.payment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {reservation.payment.status}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} a {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} de {pagination.total} resultados
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm">
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Toast 
        open={toast.open} 
        message={toast.message} 
        onClose={() => setToast({ ...toast, open: false })} 
      />
    </div>
  );
} 