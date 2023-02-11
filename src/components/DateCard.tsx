import DateModal from "./DateModal";

interface DateCardProps {
  date: {
    real: {
      title: string;
      description: string;
    };
    mystery: {
      title: string;
      description: string;
    }
    tags: { title: string; color: string }[]
  }
}

export default function DateCard({ date }: DateCardProps) {
  return (
    <div className="flex flex-col h-full max-w-sm rounded overflow-hidden shadow-lg bg-white rounded-lg">
      <div className="px-6 py-8 mb-auto ">
        <div className="font-bold text-xl mb-2">{date.mystery.title}</div>
        <p className="text-gray-700 text-base">{date.mystery.description}</p>
      </div>
      <div className="px-6">
        {date.tags.map((tag) => (
          <span
            className={`inline-block ${tag.color} rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2`}
          >
            {tag.title}
          </span>
        ))}
      </div>
      <div className="px-6 pt-2 pb-4">
        <DateModal date={date} />
      </div>
    </div>
  );
}
