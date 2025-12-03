import React, {useState} from "react";
import "../styles/CreateGroup.css";

export default function CreateGroup() {
    const [groupName, setGroupName] = useState("");

    const [members, setMembers] = useState([]);
    const [newMember, setNewMember] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupDescription, setGroupDescription] = useState("");

    const users = [
        {id: 1, name: "Oleh", email: "oleh@example.com"},
        {id: 2, name: "Julia", email: "julia@example.com"},
        {id: 3, name: "Jan", email: "jan@example.com"},
        {id: 4, name: "Tomek", email: "tomek@example.com"},
    ];

    const toggleUser = (user) => {
        if (selectedUsers.some((u) => u.id === user.id)) {
            setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        const newGroup = {
            name: groupName,
            groupDescription,
            members,
        };

        console.log("Nowa grupa:", newGroup);


        alert(`Grupa "${groupName}" została utworzona!`);
        setGroupName("");
        setGroupDescription("");
        setSelectedUsers([]);
        setMembers([]);
    };

    return (
        <div className="create-group-page">
            {/* Lewa sekcja - formularz */}
            <div className="left-section">
                <h2>Stwórz nową grupę</h2>
                <form onSubmit={handleSubmit} className="create-group-form">
                    <label>Nazwa grupy</label>
                    <input
                        type="text"
                        placeholder="Wpisz nazwę grupy..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                    />

                    <label>Opis grupy</label>
                    <textarea
                        placeholder="Dodaj krótki opis grupy..."
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        required
                    ></textarea>

                    <button type="submit" className="submit-btn">
                        Utwórz grupę
                    </button>
                </form>
            </div>

            {/* Prawa sekcja - uczestnicy */}
            <div className="right-section">
                <div className="participants-header">
                    <h3>Uczestnicy</h3>
                    <span className="count">
            Wybrano: {selectedUsers.length} / {users.length}
          </span>
                </div>

                <table className="participants-table">
                    <thead>
                    <tr>
                        <th>Użytkownik</th>
                        <th>Email</th>
                        <th>Akcja</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => {
                        const isSelected = selectedUsers.some((u) => u.id === user.id);
                        return (
                            <tr key={user.id} className={isSelected ? "selected" : ""}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <button
                                        type="button"
                                        className={`toggle-btn ${isSelected ? "remove" : "add"}`}
                                        onClick={() => toggleUser(user)}
                                    >
                                        {isSelected ? "-" : "+"}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
