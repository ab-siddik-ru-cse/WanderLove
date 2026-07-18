import { Trip, type ITripDocument } from '@/models/Trip';
import type { HydratedDocument } from 'mongoose';

interface TripAccessResult {
  trip: HydratedDocument<ITripDocument> | null;
  hasAccess: boolean;
}

/**
 * Loads a trip by id and checks whether userId is the creator or a
 * collaborator (partner). Centralized here so every trip/activity route
 * enforces the same access rule.
 */
export async function getTripWithAccessCheck(tripId: string, userId: string): Promise<TripAccessResult> {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return { trip: null, hasAccess: false };
  }

  const isCreator = trip.createdBy.toString() === userId;
  const isCollaborator = trip.collaborators.some((id) => id.toString() === userId);

  return { trip, hasAccess: isCreator || isCollaborator };
}
