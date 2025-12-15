import { useState, useEffect } from "react";
import { GRAPHQL_QUERIES } from "../queries/graphql";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Termins.css";
import { useGraphQL } from "../hooks/useGraphQL";

const TerminsView = ({ projectId }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: "", time: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const { executeQuery } = useGraphQL();

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
                        eventDate: new Date(event.eventDate)
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
            const data = await executeQuery(GRAPHQL_QUERIES.CREATE_PROJECT_EVENT, {
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
                eventDate: new Date(createdEvent.eventDate)
            };

            setEvents([...events, newEventObj]);
            setNewEvent({ title: "", time: "", description: "" });
        } catch (err) {
            console.error("Failed to create event:", err);
        }
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
                                <strong>{ev.time || "All day"}</strong> — {ev.title}
                                {ev.description && <p>{ev.description}</p>}
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
        </div>
    );
};

export default TerminsView;
