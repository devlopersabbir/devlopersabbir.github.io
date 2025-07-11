export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // Example: "Jan 1, 2023"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error parsing date:", dateString, e);
    return dateString; // Return original if parsing fails
  }
};
// TODO: theme setting will be here
