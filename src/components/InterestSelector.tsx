import React from "react";

export type Interest =
  | "Dance"
  | "Poetry"
  | "Cooking"
  | "Sports"
  | "Gaming"
  | "Music";

interface InterestSelectorProps {
  interests: Interest[];
  selected: Interest | null;
  onSelect: (interest: Interest) => void;
}

export default function InterestSelector({
  interests,
  selected,
  onSelect,
}: InterestSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {interests.map((i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`px-4 py-2 rounded-full border transition ${
            selected === i
              ? "bg-pink-500 text-white border-pink-600"
              : "bg-white hover:bg-pink-50 border-pink-200 text-pink-700"
          }`}
        >
          {i}
        </button>
      ))}
    </div>
  );
}
