import React from "react";
import "../styles/Groups.css";



import Group from "./Group";


export default function Groups({ projects }) {
    let baseGroups = [
        {
            id:1,
            name: "Shrimp Tracker",
            description: "A small app to track your shrimp collection",

        },
        {
            id:2,
            name: "Task Manager 2",
            description: "Some more hardcoded posts for designing stuff",

        },
        {
            id:3,
            name: "Defenestrator",
            description: "should replace those when we have proper project sites ready",

        },
        {
            id:3,
            name: "Defenestrator",
            description: "should replace those when we have proper project sites ready",

        },
        {
            id:3,
            name: "Defenestrator",
            description: "should replace those when we have proper project sites ready",

        },
    ];








    const searchQuery = localStorage.getItem("searchQuery") || "";
    console.log(searchQuery);
    const cleanedQuery = searchQuery.toLowerCase().trim().slice(1,-1);
    console.log(cleanedQuery);
    const groups = cleanedQuery === ""
        ? baseGroups
        : baseGroups.filter(group =>
            group?.name?.toLowerCase().includes(cleanedQuery)
                ||
            group?.description?.toLowerCase().includes(cleanedQuery)
        );



    return (
        <div className="groups-container">
            {groups.map((post, index) => (
                <Group key={index} {...post} />
            ))}
        </div>
    );
}