import React from "react";

interface SkeletonBlockProps {
  className?: string;
  width?: string;
  height?: string;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  className = "",
  width,
  height = "h-6",
}) => {
  return (
    <div
      className={`skeleton-neu ${height} ${width || "w-full"} ${className}`}
      aria-hidden="true"
    />
  );
};

// Preset skeleton shapes
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`card-neu p-6 space-y-4 ${className}`}>
    <SkeletonBlock height="h-4" width="w-2/3" />
    <SkeletonBlock height="h-3" width="w-full" />
    <SkeletonBlock height="h-3" width="w-4/5" />
    <SkeletonBlock height="h-10" width="w-1/3" />
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`card-neu p-6 ${className}`}>
    <SkeletonBlock height="h-4" width="w-1/3" className="mb-4" />
    <SkeletonBlock height="h-48" />
  </div>
);
