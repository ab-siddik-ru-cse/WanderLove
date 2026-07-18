'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, MapPin, Gift, GripVertical } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { IActivity } from '@/types';

interface ActivityItemProps {
  activity: IActivity;
  onClick: () => void;
  /** When true, costs/titles are masked for the partner (surprise mode). */
  isMaskedForViewer: boolean;
}

export function ActivityItem({ activity, onClick, isMaskedForViewer }: ActivityItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const showSurpriseMask = activity.isSurprise && isMaskedForViewer;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex cursor-pointer items-start gap-2 rounded-xl border border-ink/5 bg-white p-3 shadow-card transition-shadow hover:shadow-soft',
        isDragging && 'opacity-50'
      )}
      onClick={onClick}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="mt-1 cursor-grab touch-none text-ink/20 hover:text-ink/50 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {activity.isSurprise && <Gift className="h-3.5 w-3.5 shrink-0 text-primary" />}
          <p className="truncate font-medium text-ink">{showSurpriseMask ? '??? (surprise)' : activity.title}</p>
          {activity.mood && <span className="ml-auto shrink-0">{activity.mood}</span>}
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-ink/50">
          <Clock className="h-3 w-3" /> {activity.time}
          <span className="mx-1 text-ink/20">•</span>
          <MapPin className="h-3 w-3" /> <span className="truncate">{activity.location}</span>
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] font-medium text-primary-dark">
            {activity.category}
          </span>
          <span className="text-xs font-medium text-ink/60">
            {showSurpriseMask ? '???' : formatCurrency(activity.cost, activity.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
