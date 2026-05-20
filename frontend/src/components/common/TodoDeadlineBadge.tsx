import { memo } from "react";

// 1. Tạo một Component phụ để xử lý riêng cái Badge này
const TodoDeadlineBadge = memo(
  ({ deadline, now }: { deadline: string | Date; now: Date }) => {
    const diff = new Date(deadline).getTime() - now.getTime();

    if (diff < 0) {
      return (
        <span className="ml-2 px-2 py-0.5 rounded-full border bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 text-[10px] font-bold uppercase tracking-tight">
          Nhiệm vụ quá hạn cần hoàn thành ngay
        </span>
      );
    }

    let timeRemainingText = "";
    const oneMinute = 1000 * 60;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;

    if (diff < oneMinute) {
      const seconds = Math.floor(diff / 1000);
      timeRemainingText = `${seconds} ${seconds <= 1 ? "second" : "seconds"} left`;
    } else if (diff < oneDay) {
      const hours = Math.floor(diff / oneHour);
      const minutes = Math.floor((diff % oneHour) / oneMinute);
      const hoursText =
        hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"} ` : "";
      const minutesText = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;

      timeRemainingText = `${hoursText}${minutesText} left`;
    } else {
      const days = Math.ceil(diff / oneDay);
      timeRemainingText = `${days} ${days === 1 ? "day" : "days"} left`;
    }

    return (
      <span className="ml-2 px-2 py-0.5 rounded-full border bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 text-[10px] font-semibold uppercase tracking-tight">
        {timeRemainingText}
      </span>
    );
  },
);

export default TodoDeadlineBadge;
