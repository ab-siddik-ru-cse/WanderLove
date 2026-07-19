'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { ActivityItem } from './ActivityItem';
import type { IActivity } from '@/types';

interface DayColumnProps {
  dayId: string;
  date: string;
  activities: IActivity[];
  onActivityClick: (activity: IActivity) => void;
  onAddClick: () => void;
  isMaskedForViewer: boolean;
}

export function DayColumn({ dayId, date, activities, onActivityClick, onAddClick, isMaskedForViewer }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dayId });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl2 bg-blush/60 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/40">{format(new Date(date), 'EEEE')}</p>
          <p className="font-heading font-semibold text-ink">{format(new Date(date), 'MMM d')}</p>
        </div>
        <button
          onClick={onAddClick}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-primary shadow-card hover:bg-primary hover:text-white"
          aria-label="Add activity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[80px] flex-col gap-2 rounded-xl p-1 transition-colors ${isOver ? 'bg-primary/10' : ''}`}
      >
        <SortableContext items={activities.map((a) => a._id)} strategy={verticalListSortingStrategy}>
          {activities.map((activity) => (
            <ActivityItem
              key={activity._id}
              activity={activity}
              isMaskedForViewer={isMaskedForViewer}
              onClick={() => onActivityClick(activity)}
            />
          ))}
        </SortableContext>
        {activities.length === 0 && (
          <p className="rounded-xl border border-dashed border-ink/10 p-4 text-center text-xs text-ink/30">
            Drop an activity here
          </p>
        )}
      </div>
    </div>
  );
}
