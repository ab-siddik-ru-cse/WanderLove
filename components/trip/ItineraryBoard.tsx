'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { DayColumn } from './DayColumn';
import { ActivityItem } from './ActivityItem';
import { ActivityForm } from '@/components/forms/ActivityForm';
import { ExportPdfButton } from './ExportPdfButton';
import { addActivity, updateActivity, deleteActivity, reorderActivities } from '@/hooks/useTrips';
import type { IActivity, ICustomFieldDefinition } from '@/types';

interface DayColumnState {
  _id: string;
  date: string;
  activities: IActivity[];
}

interface ItineraryBoardProps {
  tripId: string;
  initialDays: DayColumnState[];
  categories: string[];
  customFieldDefinitions: ICustomFieldDefinition[];
  currency: string;
  currentUserId: string;
  tripCreatedBy: string;
  partnerId?: string | null;
  partnerName?: string | null;
}

export function ItineraryBoard({
  tripId,
  initialDays,
  categories,
  customFieldDefinitions,
  currency,
  currentUserId,
  tripCreatedBy,
  partnerId,
  partnerName
}: ItineraryBoardProps) {
  const [days, setDays] = useState<DayColumnState[]>(initialDays);
  const [activeActivity, setActiveActivity] = useState<IActivity | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<IActivity | null>(null);
  const [targetDayId, setTargetDayId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Surprise activities created by the *other* person should be masked for
  // the current viewer. We don't know createdBy per-activity, so as a
  // reasonable proxy: mask surprises whenever the current user isn't the
  // trip's original creator (the partner is the one being surprised).
  const isMaskedForViewer = currentUserId !== tripCreatedBy;

  function findContainer(activityId: string): string | undefined {
    return days.find((day) => day.activities.some((a) => a._id === activityId))?._id;
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    const activity = days.flatMap((d) => d.activities).find((a) => a._id === id);
    setActiveActivity(activity ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeContainer = findContainer(activeId);
    // `over` can be another activity (belongs to some day) or an empty day column itself.
    const overContainer = findContainer(overId) ?? (days.some((d) => d._id === overId) ? overId : undefined);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setDays((prev) => {
      const activeDay = prev.find((d) => d._id === activeContainer)!;
      const overDay = prev.find((d) => d._id === overContainer)!;
      const activity = activeDay.activities.find((a) => a._id === activeId)!;

      const overIndex = overDay.activities.findIndex((a) => a._id === overId);
      const insertAt = overIndex >= 0 ? overIndex : overDay.activities.length;

      return prev.map((d) => {
        if (d._id === activeContainer) {
          return { ...d, activities: d.activities.filter((a) => a._id !== activeId) };
        }
        if (d._id === overContainer) {
          const newActivities = [...d.activities];
          newActivities.splice(insertAt, 0, activity);
          return { ...d, activities: newActivities };
        }
        return d;
      });
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveActivity(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const container = findContainer(activeId);
    if (!container) return;

    setDays((prev) =>
      prev.map((d) => {
        if (d._id !== container) return d;
        const oldIndex = d.activities.findIndex((a) => a._id === activeId);
        const newIndex = d.activities.findIndex((a) => a._id === overId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return d;
        return { ...d, activities: arrayMove(d.activities, oldIndex, newIndex) };
      })
    );

    // Persist the full ordering (covers same-day reorder and cross-day moves).
    const payload = days.map((d) => ({ dayId: d._id, activityIds: d.activities.map((a) => a._id) }));
    await reorderActivities(tripId, payload);
  }

  const openAddForm = (dayId: string) => {
    setTargetDayId(dayId);
    setEditingActivity(null);
    setIsFormOpen(true);
  };

  const openEditForm = (activity: IActivity) => {
    setEditingActivity(activity);
    setTargetDayId(findContainer(activity._id) ?? null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingActivity(null);
    setTargetDayId(null);
  };

  const handleFormSubmit = async (payload: Record<string, unknown>) => {
    if (!targetDayId) return;
    setIsSubmitting(true);
    try {
      if (editingActivity) {
        const res = await updateActivity(tripId, editingActivity._id, payload);
        if (res.success && res.data) {
          setDays(mapTripDaysToState(res.data));
        }
      } else {
        const res = await addActivity(tripId, { dayId: targetDayId, ...payload });
        if (res.success && res.data) {
          setDays(mapTripDaysToState(res.data));
        }
      }
      closeForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingActivity) return;
    setIsSubmitting(true);
    try {
      const res = await deleteActivity(tripId, editingActivity._id);
      if (res.success && res.data) {
        setDays(mapTripDaysToState(res.data));
      }
      closeForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSpent = useMemo(
    () => days.reduce((sum, d) => sum + d.activities.reduce((daySum, a) => daySum + a.cost, 0), 0),
    [days]
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink/50">
          Total planned so far: <span className="font-semibold text-ink">{totalSpent.toLocaleString()}</span> {currency}
        </p>
        <ExportPdfButton targetId="itinerary-print-area" fileName={`wanderlove-itinerary-${tripId}`} />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div id="itinerary-print-area" className="flex gap-4 overflow-x-auto pb-4">
          {days.map((day) => (
            <DayColumn
              key={day._id}
              dayId={day._id}
              date={day.date}
              activities={day.activities}
              isMaskedForViewer={isMaskedForViewer}
              onActivityClick={openEditForm}
              onAddClick={() => openAddForm(day._id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeActivity ? (
            <ActivityItem activity={activeActivity} isMaskedForViewer={isMaskedForViewer} onClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <ActivityForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        onDelete={editingActivity ? handleDelete : undefined}
        categories={categories}
        customFieldDefinitions={customFieldDefinitions}
        currency={currency}
        initialActivity={editingActivity}
        isSubmitting={isSubmitting}
        currentUserId={currentUserId}
        partnerId={partnerId}
        partnerName={partnerName}
      />
    </div>
  );
}

function mapTripDaysToState(trip: any): DayColumnState[] {
  return (trip.days ?? []).map((day: any) => ({
    _id: String(day._id),
    date: new Date(day.date).toISOString(),
    activities: (day.activities ?? [])
      .slice()
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      .map((a: any) => ({ ...a, _id: String(a._id) }))
  }));
}
