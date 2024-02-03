import axios from 'axios';

const url = 'https://chat-app-busd.onrender.com/api';

const getHeader = (token) => {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const getUser = async (token) => {
    const res = await axios.get(`${url}/user`, { headers: getHeader(token) });
    return res;
};

export const getChat = async (token, chatId) => {
    const res = await axios.get(`${url}/chat/${chatId}`, { headers: getHeader(token) });
    return res;
};

export const searchUserApi = async (token, searchQuery) => {
    const response = await axios.get(`${url}/allusers`, {
        params: {
            search: searchQuery,
        },
        headers: getHeader(token),
    });

    return response
};

export const sendFrndReq = async (token, friendId) => {
    const response = await axios.post(`${url}/send-friend-req/${friendId}`, {}, {
        headers: getHeader(token),
    });

    return response;
};


export const acceptFrndReq = async (token, friendId) => {
    const response = await axios.post(`${url}/accept-friend-req/${friendId}`, {}, {
        headers: getHeader(token),
    });

    return response;
};

export const rejectFrndReq = async (token, friendId) => {
    const response = await axios.post(`${url}/reject-friend-req/${friendId}`, {}, {
        headers: getHeader(token),
    });

    return response;
};

export const deleteFrnd = async (token, friendId) => {
    const response = await axios.post(`${url}/delete-friend/${friendId}`, {}, {
        headers: getHeader(token),
    });

    return response;
}

export const sendMessage = async (token, chatId, content) => {

    const response = await axios.post(`${url}/chat/send-message/${chatId}`, { content }, {
        headers: getHeader(token),
    });

    return response;
};

export const createGroup = async (token, data) => {

    const response = await axios.post(`${url}/create-group`, data, {
        headers: getHeader(token),
    });

    return response;
};

export const addMembers = async (token, data) => {

    const response = await axios.post(`${url}/add-members-to-group`, data, {
        headers: getHeader(token),
    });

    return response;
};

export const removeMember = async (token, data) => {

    const response = await axios.post(`${url}/remove-member-from-group`, data, {
        headers: getHeader(token),
    });

    return response;
};

export const makeAdminApi = async (token, data) => {

    const response = await axios.post(`${url}/make-admin`, data, {
        headers: getHeader(token),
    });

    return response;
};

export const groupExit = async (token, data) => {

    const response = await axios.post(`${url}/exit-group`, data, {
        headers: getHeader(token),
    });

    return response;
};

export const allMesgSeenApi = async (token, chatId) => {

    const response = await axios.get(`${url}/all-msg-seen/${chatId}`, {
        headers: getHeader(token),
    });

    return response;
};

export const seenNewMessages = async (token, data) => {

    const response = await axios.post(`${url}/seen-new-messages`, data, {
        headers: getHeader(token),
    });

    return response;
};

export const userProfileUpdateApi = async (token, data) => {

    const response = await axios.post(`${url}/update-user-profile`, data, {
        headers: getHeader(token),
    });

    return response;
};

export const groupProfileUpdateApi = async (token, data) => {

    const response = await axios.post(`${url}/update-group-profile`, data, {
        headers: getHeader(token),
    });

    return response;
};

export const getGroupWithChat = async (token, data) => {

    const response = await axios.post(`${url}/get-group-chat`, data, {
        headers: getHeader(token),
    });

    return response;
};