const FilesView = () => {
    const files = [
        { name: "project-plan.pdf", size: "1.2 MB" },
        { name: "design-draft.png", size: "820 KB" },
        { name: "notes.txt", size: "3 KB" }
    ];

    return (
        <div className="files-view">
            <h2>Project Files</h2>
            <ul className="files-list">
                {files.map((file, i) => (
                    <li key={i} className="file-item">
                        📄 <span>{file.name}</span> <small>({file.size})</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FilesView;
