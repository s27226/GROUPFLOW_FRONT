import { useState, useEffect } from "react";
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from "../queries/graphql";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Termins.css";
import { useGraphQL } from "../hooks/useGraphQL";
import ConfirmDialog from "./ui/ConfirmDialog";

const TerminsView = ({ projectId, project }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: "", time: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, eventId: null });
    const { executeQuery, executeMutation } = useGraphQL();

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const data = await executeQuery(GRAPHQL_QUERIES.GET_CURRENT_USER, {});

                const userData = data.users.me;
                setCurrentUserId(userData?.id);
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
                const data = await executeQuery(GRAPHQL_QUERIES.GET_PROJECT_EVENTS, {
                    projectId: parseInt(projectId),
                    first: 50
                });

                const eventsData = data.projectEvent.eventsbyproject.nodes || [];
                setEvents(
                    eventsData.map((event) => ({
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
            const data = await executeMutation(GRAPHQL_MUTATIONS.CREATE_PROJECT_EVENT, {
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

    const handleDeleteEvent = async (eventId) => {
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
            // Could add a toast notification here instead of alert
        }
    };

    const canDeleteEvent = (event) => {
        if (!currentUserId || !project) return false;
        return event.createdById === currentUserId || project.owner?.id === currentUserId;
    };

    const handleDayClick = (date) => setSelectedDate(date);

    // Filter events for selected date
    const selectedDateEvents = events.filter(
        (ev) => ev.eventDate.toDateString() === selectedDate.toDateString()
    );

    if (loading) {
        return (
            <div className="termins-container">
                <h2 className="termins-title">🗓 Terminarz projektu</h2>
                <p>Loading events...</p>
            </div>
        );
    }

    return (
        <div className="termins-container">
            <h2 className="termins-title">🗓 Terminarz projektu</h2>

            <div className="calendar-section">
                <Calendar
                    onClickDay={handleDayClick}
                    value={selectedDate}
                    className="custom-calendar"
                    tileContent={({ date }) => {
                        const hasEvent = events.some(
                            (ev) => ev.eventDate.toDateString() === date.toDateString()
                        );
                        return hasEvent ? <div className="event-dot">•</div> : null;
                    }}
                />
            </div>

            <div className="event-panel">
                <h3>
                    Wydarzenia w dniu{" "}
                    <span className="highlight">{selectedDate.toLocaleDateString()}</span>
                </h3>

                <div className="event-list">
                    {selectedDateEvents.length === 0 ? (
                        <p className="no-events">Brak wydarzeń.</p>
                    ) : (
                        selectedDateEvents.map((ev) => (
                            <div key={ev.id} className="event-item">
                                <div className="event-content">
                                    <strong>{ev.time || "All day"}</strong> — {ev.title}
                                    {ev.description && <p>{ev.description}</p>}
                                </div>
                                {canDeleteEvent(ev) && (
                                    <button
                                        className="delete-event-btn"
                                        onClick={() => handleDeleteEvent(ev.id)}
                                        title="Delete event"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="add-event">
                    <h4>Dodaj wydarzenie</h4>
                    <input
                        type="text"
                        placeholder="Nazwa wydarzenia"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Opis (opcjonalnie)"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                    <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                    <button onClick={handleAddEvent} disabled={!currentUserId}>
                        Dodaj
                    </button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.show}
                title="Delete Event"
                message="Are you sure you want to delete this event? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                danger={true}
                onConfirm={confirmDeleteEvent}
                onCancel={() => setDeleteConfirm({ show: false, eventId: null })}
            />
        </div>
    );
};

export default TerminsView;
