"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Toast } from "../ui/Toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Reservation, Sport } from '@/lib/types';

interface PaginationInfo {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export default function ReservationsTableClient() {
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
  const estadoReservaFromUrl = searchParams.get("estado") || "";
  const [estadoReserva, setEstadoReserva] = useState<string>(estadoReservaFromUrl);

  useEffect(() => {
    setEstadoReserva(estadoReservaFromUrl);
  }, [estadoReservaFromUrl]);

  // Obtener filtros de la URL
  const deporteId = searchParams.get("deporte");
  const fechaInicio = searchParams.get("fechaInicio");
  const fechaFin = searchParams.get("fechaFin");
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
        const params = new URLSearchParams(searchParams.toString());
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
  }, [searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    // Set loading to true when changing filters
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/admin/ver-reservas?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    // Set loading to true when changing pages
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/ver-reservas?${params.toString()}`);
  };

  const handleClearDateFilters = () => {
    // Set loading to true when clearing date filters
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("fechaInicio");
    params.delete("fechaFin");
    params.set("page", "1");
    router.push(`/admin/ver-reservas?${params.toString()}`);
  };

  const filteredReservations = reservations.filter(reservation => 
    reservation.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.facility?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.facility?.sport?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table skeleton loader component with column names
  const TableSkeleton = () => (
    <div className="animate-pulse">
      <div className="overflow-x-auto">
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
              <TableHead>Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(10).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><div className="h-5 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-5 bg-gray-200 rounded w-4/5"></div></TableCell>
                <TableCell><div className="h-5 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-5 bg-gray-200 rounded w-3/4"></div></TableCell>
                <TableCell><div className="h-5 bg-gray-200 rounded w-2/3"></div></TableCell>
                <TableCell>
                  <div className="h-5 bg-gray-200 rounded w-16 inline-block"></div>
                </TableCell>
                <TableCell><div className="h-5 bg-gray-200 rounded w-2/3"></div></TableCell>
                <TableCell>
                  <div className="h-5 bg-gray-200 rounded w-16 inline-block"></div>
                </TableCell>
                <TableCell><div className="h-5 bg-gray-200 rounded w-4/5"></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="w-40 h-5 bg-gray-200 rounded"></div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-24 h-5 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <>
        {/* Filtros siempre visibles */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deporte</label>
            <select
              className="w-full p-2 border rounded-md"
              value={deporteId || ""}
              onChange={(e) => handleFilterChange("deporte", e.target.value)}
            >
              <option value="">Todos los deportes</option>
              {sports.map((sport) => (
                <optgroup key={sport.id} label={sport.name}>
                  <option value={`sport_${sport.id}`}>Todo {sport.name}</option>
                  {sport.facilities.map((facility) => (
                    <option key={facility.id} value={`facility_${facility.id}`}>
                      {facility.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              className="w-full p-2 border rounded-md"
              value={estadoReserva}
              onChange={(e) => {
                setEstadoReserva(e.target.value);
                handleFilterChange("estado", e.target.value);
              }}
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="CONFIRMED">Confirmada</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="BLOCKED">Bloqueada</option>
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Fecha desde</label>
              {(fechaInicio || fechaFin) && (
                <button
                  onClick={handleClearDateFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 ml-2"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="flex gap-1">
              <input
                type="date"
                className="w-28 p-2 border rounded-md mr-2"
                value={fechaInicio || ""}
                onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
              />
              <span className="self-center mr-2">a</span>
              <input
                type="date"
                className="w-28 p-2 border rounded-md mr-2"
                value={fechaFin || ""}
                onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
              />
            </div>
          </div>
          {/* Elimina los bloques relacionados con el filtro de hora/hora de inicio:
              - <label className="block text-sm font-medium text-gray-700">Hora de inicio</label>
              - El select/input para hora
              - Lógica de handleFilterChange para 'hora'
              - Cualquier referencia a la variable 'hora' en los filtros */}
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
        <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Filtros siempre visibles */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deporte</label>
          <select
            className="w-full p-2 border rounded-md"
            value={deporteId || ""}
            onChange={(e) => handleFilterChange("deporte", e.target.value)}
          >
            <option value="">Todos los deportes</option>
            {sports.map((sport) => (
              <optgroup key={sport.id} label={sport.name}>
                <option value={`sport_${sport.id}`}>Todo {sport.name}</option>
                {sport.facilities.map((facility) => (
                  <option key={facility.id} value={`facility_${facility.id}`}>
                    {facility.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            className="w-full p-2 border rounded-md"
            value={estadoReserva}
            onChange={(e) => {
              setEstadoReserva(e.target.value);
              handleFilterChange("estado", e.target.value);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="BLOCKED">Bloqueada</option>
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Fecha desde</label>
            {(fechaInicio || fechaFin) && (
              <button
                onClick={handleClearDateFilters}
                className="text-xs text-gray-500 hover:text-gray-700 ml-2"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="flex gap-1">
            <input
              type="date"
              className="w-28 p-2 border rounded-md mr-2"
              value={fechaInicio || ""}
              onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
            />
            <span className="self-center mr-2">a</span>
            <input
              type="date"
              className="w-28 p-2 border rounded-md mr-2"
              value={fechaFin || ""}
              onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
            />
          </div>
        </div>
        {/* Elimina los bloques relacionados con el filtro de hora/hora de inicio:
              - <label className="block text-sm font-medium text-gray-700">Hora de inicio</label>
              - El select/input para hora
              - Lógica de handleFilterChange para 'hora'
              - Cualquier referencia a la variable 'hora' en los filtros */}
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
      
      {/* Show skeleton or actual table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          {/* Tabla */}
          <div className="overflow-x-auto">
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
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => {
                  const timeZone = 'America/Argentina/Buenos_Aires';
                  const localStart = toZonedTime(reservation.startTime, timeZone);
                  const slotDuration = reservation.facility?.availability?.[0]?.slotDuration || 60;
                  const calculatedEndTime = new Date(localStart.getTime() + slotDuration * 60000);
                  return (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">{reservation.user?.name || '-'}</TableCell>
                      <TableCell>{reservation.facility?.sport?.name || '-'}</TableCell>
                      <TableCell>{reservation.facility?.name || '-'}</TableCell>
                      <TableCell>
                        {reservation.date?.slice(0, 10) || '-'}
                      </TableCell>
                      <TableCell>
                        {format(localStart, 'HH:mm')} - {format(calculatedEndTime, 'HH:mm')}
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
                      <TableCell>
                        {reservation.status === 'BLOCKED' && reservation.reason 
                          ? reservation.reason
                          : reservation.status === 'BLOCKED' && !reservation.reason
                          ? '-'
                          : reservation.reason || '-'}
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
        </>
      )}
      
      <Toast 
        open={toast.open} 
        message={toast.message} 
        onClose={() => setToast({ ...toast, open: false })} 
      />
    </>
  );
}