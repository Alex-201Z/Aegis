import { useEffect, useState } from 'react';
import { Bell, Filter, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSecurityStore } from '../stores/securityStore';
import AlertCard from '../components/AlertCard';
import type { AlertSeverity, BreachAlert } from '@aegis/shared';

type FilterType = 'all' | 'unread' | 'unresolved' | 'resolved';

export default function Alerts() {
  const { alerts, fetchAlerts, markAlertRead, resolveAlert, completeAction } = useSecurityStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [selectedAlert, setSelectedAlert] = useState<BreachAlert | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'unread' && alert.isRead) return false;
    if (filter === 'unresolved' && alert.isResolved) return false;
    if (filter === 'resolved' && !alert.isResolved) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    return true;
  });

  const handleAlertClick = (alert: BreachAlert) => {
    setSelectedAlert(alert);
    if (!alert.isRead) {
      markAlertRead(alert.id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-aegis-primary" />
            Security Alerts
          </h1>
          <p className="text-gray-400 mt-1">
            {alerts.filter((a) => !a.isRead).length} unread alerts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="input w-auto"
          >
            <option value="all">All Alerts</option>
            <option value="unread">Unread</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'all')}
          className="input w-auto"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alert List */}
        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onClick={() => handleAlertClick(alert)}
                onMarkRead={() => markAlertRead(alert.id)}
                onResolve={() => resolveAlert(alert.id)}
              />
            ))
          ) : (
            <div className="card text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto text-aegis-success opacity-50 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No alerts found</h3>
              <p className="text-gray-400">
                {filter !== 'all' || severityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Your monitored assets are secure'}
              </p>
            </div>
          )}
        </div>

        {/* Alert Detail Panel */}
        {selectedAlert && (
          <div className="card sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{selectedAlert.breach.name}</h2>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
                <p className="text-gray-300">{selectedAlert.breach.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Breach Date</h3>
                  <p className="text-white">
                    {new Date(selectedAlert.breach.breachDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Affected Records</h3>
                  <p className="text-white">
                    {selectedAlert.breach.pwnCount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Exposed Data Types</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.breach.dataClasses.map((dc) => (
                    <span key={dc} className="badge badge-danger">
                      {dc.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {selectedAlert.recommendedActions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Recommended Actions</h3>
                  <div className="space-y-2">
                    {selectedAlert.recommendedActions.map((action) => (
                      <div
                        key={action.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          action.isCompleted ? 'bg-aegis-success/10' : 'bg-aegis-dark'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded ${
                            action.isCompleted
                              ? 'bg-aegis-success/20'
                              : 'bg-aegis-warning/20'
                          }`}
                        >
                          {action.isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-aegis-success" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-aegis-warning" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              action.isCompleted ? 'text-gray-400 line-through' : 'text-white'
                            }`}
                          >
                            {action.title}
                          </p>
                          <p className="text-xs text-gray-500">{action.estimatedTime}</p>
                        </div>
                        {!action.isCompleted && (
                          <button
                            onClick={() => completeAction(action.id)}
                            className="btn-primary text-xs py-1.5"
                          >
                            Done
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedAlert.isResolved && (
                <button
                  onClick={() => {
                    resolveAlert(selectedAlert.id);
                    setSelectedAlert({ ...selectedAlert, isResolved: true });
                  }}
                  className="btn-primary w-full mt-4"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
