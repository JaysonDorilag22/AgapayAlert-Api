// facebookMessage.js
const createFacebookMessage = (report) => {
    const { reporter, missingPerson, category } = report;
    return `
  🚨 ${category} Person Alert! 🚨
  Name: ${missingPerson.firstname} ${missingPerson.lastname}
  Age: ${missingPerson.age || "N/A"}
  Last known location: ${missingPerson.lastKnownLocation || "Unknown location"}
  Last Seen: ${missingPerson.lastSeen || "Unknown location"}
  Category: ${category || "Uncategorized"}
  Reported By: ${reporter}
  
  📞 Contact us if you have any information!`;
  };
  
  module.exports = createFacebookMessage;