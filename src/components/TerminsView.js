import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Termins.css";

const TerminsView = () => {


    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [newEvent, setNewEvent] = useState({ title: "", time: "" });

    const handleAddEvent = () => {
        if (!newEvent.title.trim() || !newEvent.time.trim()) return;

        const dateKey = selectedDate.toDateString();
        const updatedEvents = {
            ...events,
            [dateKey]: [
                ...(events[dateKey] || []),
                { title: newEvent.title, time: newEvent.time },
            ],
        };

        setEvents(updatedEvents);
        setNewEvent({ title: "", time: "" });
    };

    const handleDayClick = (date) => setSelectedDate(date);

    return (
        <div className="termins-container">
            <h2 className="termins-title">🗓 Terminarz projektu</h2>

            <div className="calendar-section">
                <Calendar
                    onClickDay={handleDayClick}
                    value={selectedDate}
                    className="custom-calendar"
                />
            </div>

            <div className="event-panel">
                <h3>
                    Wydarzenia w dniu{" "}
                    <span className="highlight">{selectedDate.toLocaleDateString()}</span>
                </h3>

                <div className="event-list">
                    {(events[selectedDate.toDateString()] || []).length === 0 ? (
                        <p className="no-events">Brak wydarzeń.</p>
                    ) : (
                        events[selectedDate.toDateString()].map((ev, i) => (
                            <div key={i} className="event-item">
                                <strong>{ev.time}</strong> — {ev.title}
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
                        onChange={(e) =>
                            setNewEvent({...newEvent, title: e.target.value})
                        }
                    />
                    <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) =>
                            setNewEvent({...newEvent, time: e.target.value})
                        }
                    />
                    <button onClick={handleAddEvent}>Dodaj</button>
                </div>
            </div>
        </div>
    );
};

export default TerminsView;
