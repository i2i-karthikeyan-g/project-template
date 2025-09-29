import { format as formatDateFns } from "date-fns";

export const DATE_FORMAT = {
    FULL_DATE_TIME: "MMM dd, yyyy, hh:mm a",
    FULL_DATE: "MMM dd, yyyy",
    TIME: "hh:mm a",
    MM_DD_YYYY: "MM/dd/yyyy",
};

export const DatetimeUtils = {
    format(date: Date | string | number | undefined, pattern: string): string {
        if (!date) return "";
        try {
            const parsedDate = typeof date === "string" ? new Date(date) : date;
            return formatDateFns(parsedDate, pattern);
        } catch {
            return "";
        }
    },

};
