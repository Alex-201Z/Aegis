import { AlertTriangle, AlertOctagon, Info, CheckCircle, ChevronRight } from 'lucide-react';
import type { BreachAlert } from '@aegis/shared';

interface AlertCardProps {
  alert: BreachAlert;
  onMarkRead?: () => void;
  onResolve?: () => void;
  onClick?: () => void;
}

const severityConfig = {
  low: {
    icon: Info,
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-aegis-warning',
    bg: 'bg-aegis-warning/10',
    border: 'border-aegis-warning/30',
  },
  high: {
    icon: AlertTriangle,
    color: 'text-aegis-danger',
    bg: 'bg-aegis-danger/10',
    border: 'border-aegis-danger/30',
  },
  critical: {
    icon: AlertOctagon,
    color: 'text-aegis-critical',
    bg: 'bg-aegis-critical/10',
    border: 'border-aegis-critical/30',
  },
};

export default function AlertCard({ alert, onMarkRead, onResolve, onClick }: AlertCardProps) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`card-hover cursor-pointer ${!alert.isRead ? config.border : 'border-aegis-border'} ${
        alert.isResolved ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${config.bg}`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{alert.breach.name}</h3>
            {!alert.isRead && (
              <span className="w-2 h-2 bg-aegis-primary rounded-full" />
            )}
            {alert.isResolved && (
              <CheckCircle className="w-4 h-4 text-aegis-success" />
            )}
          </div>

          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
            {alert.breach.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Breach: {formatDate(alert.breach.breachDate)}</span>
            <span>Detected: {formatDate(alert.detectedAt)}</span>
            <span className={`badge ${config.bg} ${config.color}`}>
              {alert.severity.toUpperCase()}
            </span>
          </div>

          {alert.breach.dataClasses.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {alert.breach.dataClasses.slice(0, 4).map((dc) => (
                <span key={dc} className="badge badge-info text-xs">
                  {dc.replace(/_/g, ' ')}
                </span>
              ))}
              {alert.breach.dataClasses.length > 4 && (
                <span className="badge badge-info text-xs">
                  +{alert.breach.dataClasses.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
      </div>

      {!alert.isResolved && alert.recommendedActions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-aegis-border">
          <p className="text-xs text-gray-500 mb-2">
            {alert.recommendedActions.filter((a) => !a.isCompleted).length} actions recommended
          </p>
          <div className="flex gap-2">
            {onMarkRead && !alert.isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead();
                }}
                className="btn-secondary text-xs py-1.5"
              >
                Mark as read
              </button>
            )}
            {onResolve && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve();
                }}
                className="btn-primary text-xs py-1.5"
              >
                Resolve
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
