import React from "react";

const NoteCardSkeleton = () => {
  return (
    <div className="cursor-pointer relative flex flex-col transition-all p-2 rounded-xl group">
      {/* Placeholder for the pinned button */}
      <div className="absolute top-2 right-2 p-1 rounded-full bg-[var(--bg-primary)] animate-pulse w-3 h-3"></div>

      {/* Placeholder for the title */}
      <div className="flex-1">
        <div className="h-5 w-3/4 rounded mb-2 bg-[var(--bg-primary)] animate-pulse"></div>
        {/* Placeholder for the content preview */}
        <div className="h-4 w-2/3 rounded mb-2 bg-[var(--bg-primary)] animate-pulse"></div>
      </div>

      {/* Placeholder for the footer */}
      <div className="flex justify-between items-center mt-7">
        {/* Date */}
        <div className="h-3 w-1/4 rounded bg-[var(--bg-primary)] animate-pulse"></div>

        {/* Visibility */}
        <div className="h-3 w-1/4 rounded bg-[var(--bg-primary)] animate-pulse"></div>
      </div>
    </div>
  );
};

export default NoteCardSkeleton;
