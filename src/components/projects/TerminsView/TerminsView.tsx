import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../../../queries/graphql";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./TerminsView.module.css";
import { useGraphQL } from "../../../hooks";
import ConfirmDialog from "../../ui/ConfirmDialog";

interface ProjectOwner {
    id: string;
}

interface ProjectData {
    owner?: ProjectOwner;
}

interface EventData {
    id: string;
    title: string;
    description: string;
    time: string;
    eventDate: Date;
    createdById: string;
}

interface NewEventData {
    title: string;
    time: string;
    description: string;
}

interface DeleteConfirmState {
    show: boolean;
    eventId: string | null;
}

interface CurrentUserResponse {
    users: {
        me?: {
            id: string;
        };
    };
}

interface ProjectEventNode {
    id: string;
    title: string;
    description?: string;
    time?: string;
    eventDate: string;
    createdById: string;
}

interface ProjectEventsResponse {
    projectEvent: {
        eventsbyproject: ProjectEventNode[];
    };
}

interface CreateEventResponse {
    projectEvent: {
        createProjectEvent: {
            id: string;
            title: string;
            description?: string;
            time?: string;
            eventDate: string;
            createdById: string;
        };
    };
}

interface TerminsViewProps {
    projectId: string;
    project: ProjectData | null;
}

const TerminsView: React.FC<TerminsViewProps> = ({ projectId, project }) => {
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [events, setEvents] = useState<EventData[]>([]);
    const [newEvent, setNewEvent] = useState<NewEventData>({ title: "", time: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ show: false, eventId: null });
    const { executeQuery, executeMutation } = useGraphQL();

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const data = await executeQuery<CurrentUserResponse>(GRAPHQL_QUERIES.GET_CURRENT_USER, {});

                const userData = data.users.me;
                setCurrentUserId(userData?.id ?? null);
            } catch (err) {
                console.error("Failed to fetch current user:", err);
            }
        };

        fetchCurrentUser();
    }, [executeQuery]);

    // Fetch project events
    useEffect(() => {
        if (!projectId) return;

        const fetchEvents = async () => {
            try {
                const data = await executeQuery<ProjectEventsResponse>(GRAPHQL_QUERIES.GET_PROJECT_EVENTS, {
                    projectId: parseInt(projectId)
                });

                const eventsData = data.projectEvent.eventsbyproject || [];
                setEvents(
                    eventsData.map((event: ProjectEventNode) => ({
                        id: event.id,
                        title: event.title,
                        description: event.description || "",
                        time: event.time || "",
                        eventDate: new Date(event.eventDate),
                        createdById: event.createdById
                    }))
                );
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch events:", err);
                setLoading(false);
            }
        };

        fetchEvents();
    }, [projectId, executeQuery]);

    const handleAddEvent = async () => {
        if (!newEvent.title.trim() || !currentUserId || !projectId) return;

        try {
            const data = await executeMutation<CreateEventResponse>(GRAPHQL_MUTATIONS.CREATE_PROJECT_EVENT, {
                input: {
                    projectId: parseInt(projectId),
                    createdById: currentUserId,
                    title: newEvent.title,
                    description: newEvent.description || null,
                    eventDate: selectedDate.toISOString(),
                    time: newEvent.time || null
                }
            });

            const createdEvent = data.projectEvent.createProjectEvent;
            const newEventObj = {
                id: createdEvent.id,
                title: createdEvent.title,
                description: createdEvent.description || "",
                time: createdEvent.time || "",
                eventDate: new Date(createdEvent.eventDate),
                createdById: createdEvent.createdById
            };

            setEvents([...events, newEventObj]);
            setNewEvent({ title: "", time: "", description: "" });
        } catch (err) {
            console.error("Failed to create event:", err);
        }
    };

    const handleDeleteEvent = async (eventId: string): Promise<void> => {
        setDeleteConfirm({ show: true, eventId });
    };

    const confirmDeleteEvent = async () => {
        const eventId = deleteConfirm.eventId;
        setDeleteConfirm({ show: false, eventId: null });

        try {
            await executeMutation(GRAPHQL_MUTATIONS.DELETE_PROJECT_EVENT, {
                id: eventId
            });

            setEvents(events.filter(e => e.id !== eventId));
        } catch (err) {
            console.error("Failed to delete event:", err);
        }
    };

    const canDeleteEvent = (event: EventData): boolean => {
        if (!currentUserId || !project) return false;
        return event.createdById === currentUserId || project.owner?.id === currentUserId;
    };

    const handleDayClick = (date: Date): void => setSelectedDate(date);

    // Filter events for selected date
    const selectedDateEvents = events.filter(
        (ev) => ev.eventDate.toDateString() === selectedDate.toDateString()
    );

    if (loading) {
        return (
            <div className={styles.terminsContainer}>
                <h2 className={styles.terminsTitle}>{t('projects.projectCalendar')}</h2>
                <p>{t('projects.loadingEvents')}</p>
            </div>
        );
    }

    return (
        <div className={styles.terminsContainer}>
            <h2 className={styles.terminsTitle}>{t('projects.projectCalendar')}</h2>

            <div className={styles.calendarSection}>
                <Calendar
                    onClickDay={handleDayClick}
                    value={selectedDate}
                    className={styles.customCalendar}
                    tileContent={({ date }) => {
                        const hasEvent = events.some(
                            (ev) => ev.eventDate.toDateString() === date.toDateString()
                        );
                        return hasEvent ? <div className={styles.eventDot}>•</div> : null;
                    }}
                />
            </div>

            <div className={styles.eventPanel}>
                <h3>
                    {t('projects.eventsOnDate')}{" "}
                    <span className={styles.highlight}>{selectedDate.toLocaleDateString()}</span>
                </h3>

                <div className={styles.eventList}>
                    {selectedDateEvents.length === 0 ? (
                        <p className={styles.noEvents}>{t('projects.noEvents')}</p>
                    ) : (
                        selectedDateEvents.map((ev) => (
                            <div key={ev.id} className={styles.eventItem}>
                                <div className={styles.eventContent}>
                                    <strong>{ev.time || t('projects.allDay')}</strong> — {ev.title}
                                    {ev.description && <p>{ev.description}</p>}
                                </div>
                                {canDeleteEvent(ev) && (
                                    <button
                                        className={styles.deleteEventBtn}
                                        onClick={() => handleDeleteEvent(ev.id)}
                                        title={t('projects.deleteEvent')}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.addEvent}>
                    <h4>{t('projects.addEvent')}</h4>
                    <input
                        type="text"
                        placeholder={t('projects.eventName')}
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder={t('projects.descriptionOptional')}
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                    <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                    <button onClick={handleAddEvent} disabled={!currentUserId}>
                        {t('projects.add')}
                    </button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.show}
                title={t('projects.deleteEvent')}
                message={t('projects.deleteEventConfirm')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                danger={true}
                onConfirm={confirmDeleteEvent}
                onCancel={() => setDeleteConfirm({ show: false, eventId: null })}
            />
        </div>
    );
};

export default TerminsView;
