export function convertTimeStamp(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Function to group messages by date
export function groupMessagesByDate(messages) {
    const groupedMessages = {};

    messages.forEach((message) => {
        const date = new Date(message.timestamp).toLocaleDateString();

        if (!groupedMessages[date]) {
            groupedMessages[date] = [];
        }

        groupedMessages[date].push(message);
    });

    return groupedMessages;
}

// Function to format date label
export function formatDateLabel(date) {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date === today) {
        return "Today";
    } else if (date === yesterday.toLocaleDateString()) {
        return "Yesterday";
    } else {
        return date;
    }
}

export function formatStatus(dateString) {
    const inputDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = inputDate.toDateString() === today.toDateString();
    const isYesterday = inputDate.toDateString() === yesterday.toDateString();

    if (isToday || isYesterday) {
        const hours = inputDate.getHours();
        const minutes = inputDate.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

        return isToday ? `Today at ${formattedTime}` : `Yesterday at ${formattedTime}`;
    } else {
        return inputDate.toLocaleDateString();
    }
}
