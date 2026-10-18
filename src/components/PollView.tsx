import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PollData } from '../types';

interface PollViewProps {
  poll: PollData;
  onVote: (optionId: number) => void;
  disabled?: boolean;
}

export const PollView: React.FC<PollViewProps> = ({
  poll,
  onVote,
  disabled = false,
}) => {
  const hasVoted = poll.user_voted_option !== undefined && poll.user_voted_option !== null;
  const isEnded = new Date(poll.ends_at).getTime() < Date.now();
  const showResults = hasVoted || isEnded;

  return (
    <div className="mt-3 w-full flex flex-col gap-2 select-none">
      {poll.question && (
        <p className="font-semibold text-sm text-[#e7e9ea] mb-1">{poll.question}</p>
      )}

      <div className="flex flex-col gap-2">
        {poll.options.map((option) => {
          const percentage =
            poll.total_votes > 0
              ? Math.round((option.votes / poll.total_votes) * 100)
              : 0;
          const isSelected = poll.user_voted_option === option.id;

          if (showResults) {
            return (
              <div
                key={option.id}
                className="relative h-10 w-full rounded-md overflow-hidden bg-[#16181c] border border-[#2f3336] flex items-center px-4 justify-between"
              >
                {/* Percentage filled bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
                    isSelected ? 'bg-[#1d9bf0]/30' : 'bg-[#71767b]/20'
                  }`}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex items-center gap-2">
                  <span
                    className={`text-[15px] ${
                      isSelected ? 'font-bold text-white' : 'font-medium text-[#e7e9ea]'
                    }`}
                  >
                    {option.text}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-[#1d9bf0] stroke-black" />
                  )}
                </div>

                <span className="relative z-10 text-[15px] font-bold text-[#e7e9ea]">
                  {percentage}%
                </span>
              </div>
            );
          }

          return (
            <button
              key={option.id}
              disabled={disabled}
              onClick={() => onVote(option.id)}
              className="w-full py-2.5 px-4 rounded-full border border-[#1d9bf0] hover:bg-[#1d9bf0]/10 text-[#1d9bf0] font-bold text-[15px] text-center transition-colors duration-150 active:scale-[0.99] cursor-pointer"
            >
              {option.text}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-[#71767b] mt-1">
        <span>{poll.total_votes.toLocaleString()} votos</span>
        <span>·</span>
        <span>{isEnded ? 'Encuesta finalizada' : 'Encuesta abierta'}</span>
      </div>
    </div>
  );
};
