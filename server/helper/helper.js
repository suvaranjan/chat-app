function createUserCountList(myIds) {
    // Create an empty array to store the user count objects
    const userCountList = [];

    // Iterate through each user ID in the input array
    for (const userId of myIds) {
        // Create an object with userId and count properties, and set count to 0
        const userCountObj = { userId, count: 0 };

        // Push the created object to the userCountList array
        userCountList.push(userCountObj);
    }

    // Return the final array containing user count objects
    return userCountList;
}

function getUserIdFromSocketId(socketId, onlineUsers) {
    // Loop through the onlineUsers object to find the user ID
    for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socketId) {
            return userId;
        }
    }
    return null; // User not found
}

function findAvailableUsers(obj, keyArray) {
    // Create an empty array to store available keys:
    const availableKeys = [];

    // Iterate through each key in the key array:
    for (const key of keyArray) {
        // Check if the key exists in the object using hasOwnProperty:
        if (obj.hasOwnProperty(key)) {
            // If it exists, add it to the availableKeys array:
            availableKeys.push(key);
        }
    }

    // Return the array of available keys:
    return availableKeys;
}

module.exports = { createUserCountList, getUserIdFromSocketId, findAvailableUsers };
