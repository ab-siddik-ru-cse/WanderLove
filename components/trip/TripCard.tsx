'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import type { ITrip } from '@/types';

interface TripCardProps {
  trip: Pick<ITrip, '_id' | 'name' | 'destination' | 'country' | 'startDate' | 'endDate' | 'coverImage' | 'totalBudget' | 'currency'>;
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link href={`/trips/${trip._id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="card-surface overflow-hidden"
      >
        <div
          className="h-32 w-full bg-love-gradient bg-cover bg-center"
          style={trip.coverImage ? { backgroundImage: `url(${trip.coverImage})` } : undefined}
        />
        <div className="p-5">
          <h3 className="font-heading text-lg font-semibold text-ink">{trip.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/50">
            <MapPin className="h-3.5 w-3.5" />
            {trip.destination}, {trip.country}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/40">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
          </p>
          <p className="mt-3 text-sm font-medium text-primary-dark">
            Budget: {formatCurrency(trip.totalBudget, trip.currency)}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
