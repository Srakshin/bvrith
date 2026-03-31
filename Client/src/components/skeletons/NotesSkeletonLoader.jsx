import React from "react";
import NoteCardSkeleton from "./NoteCardSkeleton";

const NotesSkeletonLoader = ({ count = 12 }) => {
  return (
    <div    
      className="grid gap-2 mt-1"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl p-4 h-[140px] animate-pulse flex flex-col justify-between"
          style={{
            backgroundColor: "var(--bg-ter)",
            border: "1px solid var(--bg-secondary)",
          }}
        >
          <NoteCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default NotesSkeletonLoader;
