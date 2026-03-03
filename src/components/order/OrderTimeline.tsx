import type { OrderStatus } from '../../types/order.types';

interface OrderTimelineProps {
    status: OrderStatus;
    confirmedAt?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
    cancelledAt?: string | null;
}

interface TimelineStep {
    key: OrderStatus;
    label: string;
    icon: string; // material-symbols-outlined name
}

const formatDate = (date: string | null | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const steps: TimelineStep[] = [
    { key: 'CONFIRMED', label: 'Confirmed', icon: 'check' },
    { key: 'PENDING', label: 'Processing', icon: 'settings' },
    { key: 'SHIPPED', label: 'Shipped', icon: 'local_shipping' },
    { key: 'DELIVERED', label: 'Delivered', icon: 'inventory_2' },
];

const statusOrder: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const OrderTimeline = ({ status, confirmedAt: _confirmedAt, shippedAt: _shippedAt, deliveredAt: _deliveredAt, cancelledAt }: OrderTimelineProps) => {
    const isCancelled = status === 'CANCELLED';
    const currentIndex = isCancelled ? -1 : statusOrder.indexOf(status);

    // Timeline progress width: 0%, 33%, 66%, 100%
    const progressPercent = isCancelled ? 0 : Math.round((currentIndex / (statusOrder.length - 1)) * 100);

    if (isCancelled) {
        return (
            <div className="od-cancelled-banner">
                <div className="od-cancelled-banner-icon">
                    <span className="material-symbols-outlined">close</span>
                </div>
                <div>
                    <p className="od-cancelled-banner-text">Order has been cancelled</p>
                    {cancelledAt && (
                        <p className="od-cancelled-banner-date">{formatDate(cancelledAt)}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="od-timeline-card">
            <div className="od-timeline">
                {/* Track background */}
                <div className="od-timeline-track" />
                {/* Progress fill */}
                <div className="od-timeline-progress" style={{ width: `${progressPercent}%` }} />

                {/* Steps */}
                <div className="od-timeline-steps">
                    {steps.map((step, _index) => {
                        const stepIdx = statusOrder.indexOf(step.key);
                        const isActive = stepIdx <= currentIndex && stepIdx >= 0;
                        const isCurrent = stepIdx === currentIndex;

                        const circleClass = isCurrent
                            ? 'od-timeline-circle od-timeline-circle--current'
                            : isActive
                                ? 'od-timeline-circle od-timeline-circle--active'
                                : 'od-timeline-circle od-timeline-circle--pending';

                        const labelClass = isActive
                            ? 'od-timeline-label od-timeline-label--active'
                            : 'od-timeline-label od-timeline-label--pending';

                        return (
                            <div key={step.key} className="od-timeline-step">
                                <div className={circleClass}>
                                    <span className="material-symbols-outlined">{step.icon}</span>
                                </div>
                                <span className={labelClass}>{step.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OrderTimeline;
